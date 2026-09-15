import { getDayCount } from './formatters';

// All money math is done in integer cents to avoid floating-point errors
// (e.g. 0.1 + 0.2 !== 0.3). Inputs/outputs are decimal MYR numbers.
const toCents = (amount: number): number => Math.round(amount * 100);
const fromCents = (cents: number): number => cents / 100;

export const calculateRentalAmount = (dailyRate: number, startDate: string | Date, endDate: string | Date): number => {
  const days = getDayCount(startDate, endDate);
  return fromCents(toCents(dailyRate) * days);
};

export const calculateTotalWithDeposit = (dailyRate: number, startDate: string | Date, endDate: string | Date, depositAmount: number): number => {
  const rentalCents = toCents(calculateRentalAmount(dailyRate, startDate, endDate));
  return fromCents(rentalCents + toCents(depositAmount));
};

// Settlement at return: the actual return date drives a pro-rated charge
// (min 1 day), then penalty is added and discount subtracted. The deposit and
// any earlier payments reduce what's collected now (a negative result = refund).
export const calculateSettlement = (params: {
  dailyRate: number;
  startDate: string | Date;
  actualReturnDate: string | Date;
  depositAmount: number;
  amountPaid: number;
  discount: number;
  penalty: number;
}): { days: number; recalculatedCharge: number; settledTotal: number; collectNow: number } => {
  const days = Math.max(1, getDayCount(params.startDate, params.actualReturnDate));
  const recalculatedCharge = fromCents(toCents(params.dailyRate) * days);
  const settledTotal = fromCents(
    toCents(recalculatedCharge) + toCents(params.penalty) - toCents(params.discount)
  );
  const collectNow = fromCents(
    toCents(settledTotal) - toCents(params.depositAmount) - toCents(params.amountPaid)
  );
  return { days, recalculatedCharge, settledTotal, collectNow };
};

export const calculateNetProfit = (totalRevenue: number, totalExpenses: number): number => {
  return fromCents(toCents(totalRevenue) - toCents(totalExpenses));
};

export const calculatePartnerCommission = (netProfit: number, commissionRate: number): number => {
  // commissionRate is a percentage (e.g. 20 for 20%)
  return fromCents(Math.round(toCents(netProfit) * (commissionRate / 100)));
};

export const calculateMonthlyStats = (
  rentals: Array<{ total_amount: number }>,
  carExpenses: Array<{ amount: number }>,
  generalExpenses: Array<{ amount: number }>
): { totalRevenue: number; totalExpenses: number; netProfit: number } => {
  const totalRevenue = fromCents(rentals.reduce((sum, r) => sum + toCents(r.total_amount), 0));
  const carExpensesTotal = carExpenses.reduce((sum, e) => sum + toCents(e.amount), 0);
  const generalExpensesTotal = generalExpenses.reduce((sum, e) => sum + toCents(e.amount), 0);
  const totalExpenses = fromCents(carExpensesTotal + generalExpensesTotal);
  const netProfit = calculateNetProfit(totalRevenue, totalExpenses);

  return { totalRevenue, totalExpenses, netProfit };
};

export const calculateCarStats = (
  carRentals: Array<{ total_amount: number }>,
  carExpenses: Array<{ amount: number }>
): { revenue: number; expenses: number; profit: number } => {
  const revenue = fromCents(carRentals.reduce((sum, r) => sum + toCents(r.total_amount), 0));
  const expenses = fromCents(carExpenses.reduce((sum, e) => sum + toCents(e.amount), 0));
  const profit = calculateNetProfit(revenue, expenses);

  return { revenue, expenses, profit };
};
