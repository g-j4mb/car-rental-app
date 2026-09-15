-- Disable the problematic trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- This allows users to be created without profile
-- We'll create profiles manually instead
