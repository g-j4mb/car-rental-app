-- Add a logical-delete flag to partners (preserves payment history & car links)
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
