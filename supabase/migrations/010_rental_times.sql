-- Add clock times to rentals so a car can be returned and re-rented the same
-- day without a false overlap. Existing rows default to midnight.
ALTER TABLE rentals
  ADD COLUMN IF NOT EXISTS start_time TIME NOT NULL DEFAULT '00:00',
  ADD COLUMN IF NOT EXISTS end_time   TIME NOT NULL DEFAULT '00:00';

-- Replace the availability check with a timestamp-based one using an
-- exclusive upper bound '[)', so a rental ending at the exact instant another
-- begins does NOT count as overlapping (same-day delivery + re-rent is fine).
DROP FUNCTION IF EXISTS is_car_available(UUID, DATE, DATE);

CREATE OR REPLACE FUNCTION is_car_available(
  car_uuid UUID,
  start_dt DATE,
  end_dt DATE,
  start_tm TIME DEFAULT '00:00',
  end_tm TIME DEFAULT '00:00'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM rentals
    WHERE car_id = car_uuid
    AND status IN ('reserved', 'active')
    AND tsrange((start_date + start_time), (end_date + end_time), '[)')
        && tsrange((start_dt + start_tm), (end_dt + end_tm), '[)')
  );
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;
