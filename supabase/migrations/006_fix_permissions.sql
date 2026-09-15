-- ============================================================
-- FIX PERMISSIONS & RLS (idempotent — safe to run multiple times)
-- ============================================================

-- 1. Grant base table privileges to the API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Make sure future tables also get these grants automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- 2. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payments ENABLE ROW LEVEL SECURITY;

-- 3. Helper: a SECURITY DEFINER function to read the current user's role
--    WITHOUT triggering RLS recursion on the profiles table.
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_user_partner_id()
RETURNS UUID AS $$
  SELECT partner_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 4. PROFILES policies (no recursion — SELECT is open to authenticated,
--    writes are limited to the user's own row)
DROP POLICY IF EXISTS profiles_read ON profiles;
DROP POLICY IF EXISTS profiles_write ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;

CREATE POLICY profiles_read ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_insert_self ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_self ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- 5. PARTNERS
DROP POLICY IF EXISTS partners_read ON partners;
DROP POLICY IF EXISTS partners_write ON partners;
DROP POLICY IF EXISTS partners_update ON partners;

CREATE POLICY partners_read ON partners
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff') OR id = current_user_partner_id()
  );
CREATE POLICY partners_write ON partners
  FOR INSERT TO authenticated WITH CHECK (current_user_role() IN ('admin', 'staff'));
CREATE POLICY partners_update ON partners
  FOR UPDATE TO authenticated USING (current_user_role() IN ('admin', 'staff'));

-- 6. CARS
DROP POLICY IF EXISTS cars_read ON cars;
DROP POLICY IF EXISTS cars_write ON cars;
DROP POLICY IF EXISTS cars_update ON cars;

CREATE POLICY cars_read ON cars
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff') OR partner_id = current_user_partner_id()
  );
CREATE POLICY cars_write ON cars
  FOR INSERT TO authenticated WITH CHECK (current_user_role() IN ('admin', 'staff'));
CREATE POLICY cars_update ON cars
  FOR UPDATE TO authenticated USING (current_user_role() IN ('admin', 'staff'));

-- 7. CUSTOMERS (staff/admin only)
DROP POLICY IF EXISTS customers_read ON customers;
DROP POLICY IF EXISTS customers_write ON customers;
DROP POLICY IF EXISTS customers_update ON customers;

CREATE POLICY customers_read ON customers
  FOR SELECT TO authenticated USING (current_user_role() IN ('admin', 'staff'));
CREATE POLICY customers_write ON customers
  FOR INSERT TO authenticated WITH CHECK (current_user_role() IN ('admin', 'staff'));
CREATE POLICY customers_update ON customers
  FOR UPDATE TO authenticated USING (current_user_role() IN ('admin', 'staff'));

-- 8. RENTALS
DROP POLICY IF EXISTS rentals_read ON rentals;
DROP POLICY IF EXISTS rentals_write ON rentals;
DROP POLICY IF EXISTS rentals_update ON rentals;

CREATE POLICY rentals_read ON rentals
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff')
    OR car_id IN (SELECT id FROM cars WHERE partner_id = current_user_partner_id())
  );
CREATE POLICY rentals_write ON rentals
  FOR INSERT TO authenticated WITH CHECK (current_user_role() IN ('admin', 'staff'));
CREATE POLICY rentals_update ON rentals
  FOR UPDATE TO authenticated USING (current_user_role() IN ('admin', 'staff'));

-- 9. CAR EXPENSES
DROP POLICY IF EXISTS car_expenses_read ON car_expenses;
DROP POLICY IF EXISTS car_expenses_write ON car_expenses;
DROP POLICY IF EXISTS car_expenses_update ON car_expenses;

CREATE POLICY car_expenses_read ON car_expenses
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff')
    OR car_id IN (SELECT id FROM cars WHERE partner_id = current_user_partner_id())
  );
CREATE POLICY car_expenses_write ON car_expenses
  FOR INSERT TO authenticated WITH CHECK (current_user_role() IN ('admin', 'staff'));
CREATE POLICY car_expenses_update ON car_expenses
  FOR UPDATE TO authenticated USING (current_user_role() IN ('admin', 'staff'));

-- 10. GENERAL EXPENSES (staff/admin only)
DROP POLICY IF EXISTS general_expenses_read ON general_expenses;
DROP POLICY IF EXISTS general_expenses_write ON general_expenses;
DROP POLICY IF EXISTS general_expenses_update ON general_expenses;

CREATE POLICY general_expenses_read ON general_expenses
  FOR SELECT TO authenticated USING (current_user_role() IN ('admin', 'staff'));
CREATE POLICY general_expenses_write ON general_expenses
  FOR INSERT TO authenticated WITH CHECK (current_user_role() IN ('admin', 'staff'));
CREATE POLICY general_expenses_update ON general_expenses
  FOR UPDATE TO authenticated USING (current_user_role() IN ('admin', 'staff'));

-- 11. PARTNER PAYMENTS
DROP POLICY IF EXISTS partner_payments_read ON partner_payments;
DROP POLICY IF EXISTS partner_payments_write ON partner_payments;
DROP POLICY IF EXISTS partner_payments_update ON partner_payments;

CREATE POLICY partner_payments_read ON partner_payments
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff') OR partner_id = current_user_partner_id()
  );
CREATE POLICY partner_payments_write ON partner_payments
  FOR INSERT TO authenticated WITH CHECK (current_user_role() IN ('admin', 'staff'));
CREATE POLICY partner_payments_update ON partner_payments
  FOR UPDATE TO authenticated USING (current_user_role() IN ('admin', 'staff'));
