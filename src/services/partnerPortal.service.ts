import { supabase } from './supabase';
import { Car, Partner, CarExpense, PartnerPayment } from '../types';
import type { RentalWithRelations } from './rental.service';

// Data for the partner-facing portal, scoped to the logged-in partner. RLS
// already restricts rows to the partner, and we also filter by partner_id
// explicitly so the queries are correct regardless of policy coverage.
const mapRental = (row: any): RentalWithRelations => {
  const car = Array.isArray(row.cars) ? row.cars[0] : row.cars;
  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
  return {
    ...row,
    car_name: car ? `${car.make} ${car.model} ${car.plate_number}` : '—',
    customer_name: customer?.full_name ?? '—',
  };
};

export const partnerPortalService = {
  async getMyPartner(partnerId: string): Promise<Partner | null> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', partnerId)
      .maybeSingle();
    if (error) throw error;
    return (data as Partner) ?? null;
  },

  async getMyCars(partnerId: string): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('partner_id', partnerId)
      .neq('status', 'inactive')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Car[]) ?? [];
  },

  async getMyRentals(partnerId: string): Promise<RentalWithRelations[]> {
    const { data, error } = await supabase
      .from('rentals')
      .select('*, cars!inner ( make, model, plate_number, partner_id ), customers ( full_name )')
      .eq('cars.partner_id', partnerId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRental);
  },

  async getMyCarExpenses(partnerId: string): Promise<CarExpense[]> {
    const { data, error } = await supabase
      .from('car_expenses')
      .select('*, cars!inner ( partner_id )')
      .eq('cars.partner_id', partnerId);
    if (error) throw error;
    return (data as CarExpense[]) ?? [];
  },

  async getMyPayments(partnerId: string): Promise<PartnerPayment[]> {
    const { data, error } = await supabase
      .from('partner_payments')
      .select('*')
      .eq('partner_id', partnerId)
      .order('month', { ascending: false });
    if (error) throw error;
    return (data as PartnerPayment[]) ?? [];
  },
};
