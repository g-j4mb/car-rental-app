-- ============================================================
-- PARTNER PORTAL RLS (idempotent)
-- ============================================================
-- These partner read policies already exist in 006_fix_permissions.sql; this
-- migration re-asserts ONLY the partner-relevant read access so the partner
-- portal is guaranteed to work, without needing to re-run all of 006. It reuses
-- the same policy names, so running it is a clean no-op if 006 is applied.
--
-- Depends on the SECURITY DEFINER helpers from 006:
--   current_user_role()        -> the caller's role ('admin' | 'staff' | 'partner')
--   current_user_partner_id()  -> the caller's partner_id (NULL for staff/admin)
-- They are recreated here so this file is self-contained.

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_user_partner_id()
RETURNS UUID AS $$
  SELECT partner_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Make sure RLS is on for the tables the portal reads.
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payments ENABLE ROW LEVEL SECURITY;

-- A partner can read their own partner record.
DROP POLICY IF EXISTS partners_read ON partners;
CREATE POLICY partners_read ON partners
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff') OR id = current_user_partner_id()
  );

-- A partner can read their own cars.
DROP POLICY IF EXISTS cars_read ON cars;
CREATE POLICY cars_read ON cars
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff') OR partner_id = current_user_partner_id()
  );

-- A partner can read rentals for their cars.
DROP POLICY IF EXISTS rentals_read ON rentals;
CREATE POLICY rentals_read ON rentals
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff')
    OR car_id IN (SELECT id FROM cars WHERE partner_id = current_user_partner_id())
  );

-- A partner can read expenses for their cars.
DROP POLICY IF EXISTS car_expenses_read ON car_expenses;
CREATE POLICY car_expenses_read ON car_expenses
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff')
    OR car_id IN (SELECT id FROM cars WHERE partner_id = current_user_partner_id())
  );

-- A partner can read their own settlement records.
DROP POLICY IF EXISTS partner_payments_read ON partner_payments;
CREATE POLICY partner_payments_read ON partner_payments
  FOR SELECT TO authenticated USING (
    current_user_role() IN ('admin', 'staff') OR partner_id = current_user_partner_id()
  );

-- Note: customers and general_expenses remain staff/admin-only by design — the
-- partner portal does not read them (rental cards show the car, not the renter).
