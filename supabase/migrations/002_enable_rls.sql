-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Everyone can read public profile data
CREATE POLICY "profiles_read" ON profiles
  FOR SELECT USING (true);

-- Only admin can write profiles
CREATE POLICY "profiles_write" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Partners RLS Policies
-- Staff and admin can read all partners
-- Partners can read themselves
CREATE POLICY "partners_read" ON partners
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
    OR
    id = (SELECT partner_id FROM profiles WHERE id = auth.uid())
  );

-- Only admin can write partners
CREATE POLICY "partners_write" ON partners
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "partners_update" ON partners
  FOR UPDATE WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Cars RLS Policies
-- Staff/admin can read all cars
-- Partners can only read their own cars
CREATE POLICY "cars_read" ON cars
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
    OR
    partner_id = (SELECT partner_id FROM profiles WHERE id = auth.uid())
  );

-- Only admin/staff can create/update cars
CREATE POLICY "cars_write" ON cars
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "cars_update" ON cars
  FOR UPDATE WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

-- Customers RLS Policies
-- Only staff/admin can access customers
CREATE POLICY "customers_read" ON customers
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "customers_write" ON customers
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "customers_update" ON customers
  FOR UPDATE WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

-- Rentals RLS Policies
-- Staff/admin can read all rentals
-- Partners can only read rentals for their own cars
CREATE POLICY "rentals_read" ON rentals
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
    OR
    car_id IN (
      SELECT id FROM cars WHERE partner_id = (SELECT partner_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Only staff/admin can create/update rentals
CREATE POLICY "rentals_write" ON rentals
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "rentals_update" ON rentals
  FOR UPDATE WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

-- Car Expenses RLS Policies
-- Staff/admin can read all
-- Partners can only read expenses for their cars
CREATE POLICY "car_expenses_read" ON car_expenses
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
    OR
    car_id IN (
      SELECT id FROM cars WHERE partner_id = (SELECT partner_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Only staff/admin can write
CREATE POLICY "car_expenses_write" ON car_expenses
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "car_expenses_update" ON car_expenses
  FOR UPDATE WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

-- General Expenses RLS Policies
-- Only staff/admin can access
CREATE POLICY "general_expenses_read" ON general_expenses
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "general_expenses_write" ON general_expenses
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "general_expenses_update" ON general_expenses
  FOR UPDATE WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

-- Partner Payments RLS Policies
-- Staff/admin can read all
-- Partners can only read their own payments
CREATE POLICY "partner_payments_read" ON partner_payments
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
    OR
    partner_id = (SELECT partner_id FROM profiles WHERE id = auth.uid())
  );

-- Only staff/admin can write
CREATE POLICY "partner_payments_write" ON partner_payments
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "partner_payments_update" ON partner_payments
  FOR UPDATE WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  );
