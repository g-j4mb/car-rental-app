export type UserRole = 'admin' | 'staff' | 'partner';

export interface User {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  partner_id?: string;
  email: string;
}

export interface Partner {
  id: string;
  name: string;
  phone: string;
  commission_rate: number;
  notes?: string;
  // Email of the manually-created Supabase Auth login linked to this partner.
  login_email?: string | null;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  color: string;
  owner_type: 'company' | 'partner';
  partner_id?: string;
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  id_number: string;
  license_number: string;
  notes?: string;
  created_at: string;
}

export interface Rental {
  id: string;
  car_id: string;
  customer_id: string;
  created_by: string;
  start_date: string;
  end_date: string;
  start_time: string; // 'HH:MM' / 'HH:MM:SS'
  end_time: string;
  actual_return_date?: string;
  rental_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  amount_paid: number;
  // Settlement fields (populated on return) — see migration 009.
  discount_amount: number;
  penalty_amount: number;
  settled_total?: number;
  status: 'reserved' | 'active' | 'returned' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CarExpense {
  id: string;
  car_id: string;
  month: string;
  category: 'oil_change' | 'repair' | 'parking' | 'maintenance' | 'other';
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface GeneralExpense {
  id: string;
  month: string;
  category: 'salary' | 'rent' | 'utilities' | 'other';
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface PartnerPayment {
  id: string;
  partner_id: string;
  month: string;
  gross_revenue: number;
  total_car_expenses: number;
  net_profit: number;
  commission_rate: number;
  commission_amount: number;
  paid_at?: string;
  notes?: string;
  created_at: string;
}
