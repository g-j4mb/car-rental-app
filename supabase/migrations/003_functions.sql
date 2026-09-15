-- Function to check car availability
CREATE OR REPLACE FUNCTION is_car_available(
  car_uuid UUID,
  start_dt DATE,
  end_dt DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM rentals
    WHERE car_id = car_uuid
    AND status IN ('reserved', 'active')
    AND daterange(start_date, end_date, '[]') && daterange(start_dt, end_dt, '[]')
  );
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Function to calculate monthly car revenue
CREATE OR REPLACE FUNCTION get_car_revenue(
  car_uuid UUID,
  month_start DATE
)
RETURNS DECIMAL AS $$
DECLARE
  month_end DATE;
  total DECIMAL;
BEGIN
  month_end := date_trunc('month', month_start + interval '1 month')::DATE - interval '1 day';

  SELECT COALESCE(SUM(total_amount), 0)
  INTO total
  FROM rentals
  WHERE car_id = car_uuid
  AND status IN ('active', 'returned')
  AND start_date >= month_start
  AND end_date <= month_end;

  RETURN total;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Function to calculate monthly car expenses
CREATE OR REPLACE FUNCTION get_car_expenses(
  car_uuid UUID,
  month_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
  month_start DATE;
  total DECIMAL;
BEGIN
  month_start := date_trunc('month', month_date)::DATE;

  SELECT COALESCE(SUM(amount), 0)
  INTO total
  FROM car_expenses
  WHERE car_id = car_uuid
  AND month = month_start;

  RETURN total;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Function to get total monthly general expenses
CREATE OR REPLACE FUNCTION get_general_expenses(month_date DATE)
RETURNS DECIMAL AS $$
DECLARE
  month_start DATE;
  total DECIMAL;
BEGIN
  month_start := date_trunc('month', month_date)::DATE;

  SELECT COALESCE(SUM(amount), 0)
  INTO total
  FROM general_expenses
  WHERE month = month_start;

  RETURN total;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Trigger to update profiles.updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Trigger to update cars.updated_at
CREATE OR REPLACE FUNCTION update_cars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER cars_updated_at
BEFORE UPDATE ON cars
FOR EACH ROW
EXECUTE FUNCTION update_cars_updated_at();

-- Trigger to update rentals.updated_at
CREATE OR REPLACE FUNCTION update_rentals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER rentals_updated_at
BEFORE UPDATE ON rentals
FOR EACH ROW
EXECUTE FUNCTION update_rentals_updated_at();

-- Trigger to create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'staff');
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
