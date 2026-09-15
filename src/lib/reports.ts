import { getMonthKey } from './formatters';
import {
  calculateMonthlyStats,
  calculateCarStats,
  calculatePartnerCommission,
} from './financial';
import type { Car, Partner, GeneralExpense } from '../types';
import type { RentalWithRelations } from '../services/rental.service';
import type { CarExpenseWithCar } from '../services/expense.service';

// Only these statuses count toward revenue (reserved/cancelled don't).
const REVENUE_STATUSES = ['active', 'returned'];

// Rentals are attributed to a month by their start date.
const rentalsInMonth = (rentals: RentalWithRelations[], monthKey: string) =>
  rentals.filter(
    (r) => REVENUE_STATUSES.includes(r.status) && getMonthKey(r.start_date) === monthKey
  );

const expensesInMonth = <T extends { month: string }>(expenses: T[], monthKey: string) =>
  expenses.filter((e) => getMonthKey(e.month) === monthKey);

export interface DashboardStats {
  activeRentals: number;
  dueToday: number;
  monthlyRevenue: number;
  availableCars: number;
  totalCars: number;
}

export const getDashboardStats = (
  rentals: RentalWithRelations[],
  cars: Car[],
  today: string
): DashboardStats => {
  const active = rentals.filter((r) => r.status === 'active');
  const monthRevenue = calculateMonthlyStats(
    rentalsInMonth(rentals, getMonthKey(today)),
    [],
    []
  ).totalRevenue;

  return {
    activeRentals: active.length,
    dueToday: active.filter((r) => r.end_date === today).length,
    monthlyRevenue: monthRevenue,
    availableCars: cars.filter((c) => c.status === 'available').length,
    totalCars: cars.length,
  };
};

// Active rentals whose end date is today or earlier (due back / overdue),
// soonest first.
export const getDueBack = (rentals: RentalWithRelations[], today: string) =>
  rentals
    .filter((r) => r.status === 'active' && r.end_date <= today)
    .sort((a, b) => a.end_date.localeCompare(b.end_date));

export interface MonthlySummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export const getMonthlySummary = (
  rentals: RentalWithRelations[],
  carExpenses: CarExpenseWithCar[],
  generalExpenses: GeneralExpense[],
  monthKey: string
): MonthlySummary =>
  calculateMonthlyStats(
    rentalsInMonth(rentals, monthKey),
    expensesInMonth(carExpenses, monthKey),
    expensesInMonth(generalExpenses, monthKey)
  );

export interface CarReport {
  car: Car;
  revenue: number;
  expenses: number;
  profit: number;
}

export const getPerCarBreakdown = (
  cars: Car[],
  rentals: RentalWithRelations[],
  carExpenses: CarExpenseWithCar[],
  monthKey: string
): CarReport[] => {
  const monthRentals = rentalsInMonth(rentals, monthKey);
  const monthExpenses = expensesInMonth(carExpenses, monthKey);

  return cars
    .map((car) => {
      const stats = calculateCarStats(
        monthRentals.filter((r) => r.car_id === car.id),
        monthExpenses.filter((e) => e.car_id === car.id)
      );
      return { car, ...stats };
    })
    .filter((c) => c.revenue !== 0 || c.expenses !== 0);
};

export interface PartnerReport {
  partner: Partner;
  revenue: number;
  expenses: number;
  netProfit: number;
  commission: number;
}

export const getPartnerSettlements = (
  partners: Partner[],
  cars: Car[],
  rentals: RentalWithRelations[],
  carExpenses: CarExpenseWithCar[],
  monthKey: string
): PartnerReport[] => {
  const monthRentals = rentalsInMonth(rentals, monthKey);
  const monthExpenses = expensesInMonth(carExpenses, monthKey);

  return partners.map((partner) => {
    const partnerCarIds = cars
      .filter((c) => c.owner_type === 'partner' && c.partner_id === partner.id)
      .map((c) => c.id);

    const stats = calculateCarStats(
      monthRentals.filter((r) => partnerCarIds.includes(r.car_id)),
      monthExpenses.filter((e) => partnerCarIds.includes(e.car_id))
    );

    return {
      partner,
      revenue: stats.revenue,
      expenses: stats.expenses,
      netProfit: stats.profit,
      commission: calculatePartnerCommission(stats.profit, partner.commission_rate),
    };
  });
};
