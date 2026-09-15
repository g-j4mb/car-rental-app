-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'partner')),
  partner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create partners table
CREATE TABLE partners (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for partner_id
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_partner_id FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

-- Create cars table
CREATE TABLE cars (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate_number TEXT NOT NULL UNIQUE,
  color TEXT,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('company', 'partner')),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE customers (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_number TEXT UNIQUE,
  license_number TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rentals table
CREATE TABLE rentals (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_return_date DATE,
  rental_type TEXT NOT NULL CHECK (rental_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  daily_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'active', 'returned', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_expenses table
CREATE TABLE car_expenses (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('oil_change', 'repair', 'parking', 'maintenance', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create general_expenses table
CREATE TABLE general_expenses (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('salary', 'rent', 'utilities', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create partner_payments table
CREATE TABLE partner_payments (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  gross_revenue DECIMAL(10,2) NOT NULL,
  total_car_expenses DECIMAL(10,2) NOT NULL,
  net_profit DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_rentals_car_id ON rentals(car_id);
CREATE INDEX idx_rentals_customer_id ON rentals(customer_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_date_range ON rentals(start_date, end_date);
CREATE INDEX idx_cars_partner_id ON cars(partner_id);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_car_expenses_car_id ON car_expenses(car_id);
CREATE INDEX idx_car_expenses_month ON car_expenses(month);
CREATE INDEX idx_general_expenses_month ON general_expenses(month);
CREATE INDEX idx_partner_payments_partner_id ON partner_payments(partner_id);
CREATE INDEX idx_partner_payments_month ON partner_payments(month);
CREATE INDEX idx_profiles_role ON profiles(role);
