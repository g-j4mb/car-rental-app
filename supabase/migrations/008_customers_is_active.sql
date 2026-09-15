-- Add a logical-delete flag to customers (preserves rental history)
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
