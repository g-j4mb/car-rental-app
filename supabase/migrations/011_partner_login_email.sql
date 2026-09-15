-- Reference field: the email of the Supabase Auth login linked to this partner.
-- The actual auth account is created manually in the Supabase dashboard (with a
-- profiles row: role='partner', partner_id=<this partner>). This column just
-- records the email so staff can see which login belongs to the partner.
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS login_email TEXT;
