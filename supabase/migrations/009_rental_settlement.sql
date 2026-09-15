-- Settlement fields, populated when a rental is returned/delivered.
-- The actual return date is the source of truth: the charge is recalculated
-- (pro-rated days x daily_rate), then a penalty/discount may be applied.
-- settled_total = recalculated_charge + penalty_amount - discount_amount.
ALTER TABLE rentals
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS settled_total   DECIMAL(10,2);
