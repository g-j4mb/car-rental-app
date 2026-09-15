# Supabase Setup Guide for Car Rental App

## ðŸŽ¯ Overview

This guide walks you through setting up Supabase for the Car Rental App.

---

## Step 1: Create Supabase Project

1. **Go to**: https://supabase.com/dashboard
2. **Click**: "New Project"
3. **Fill in**:
   - **Project Name**: `car-rental-app` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
4. **Wait**: 2-3 minutes for project initialization

---

## Step 2: Get API Credentials

1. Once project is ready, click it to open
2. Go to **Settings â†’ API** (left sidebar)
3. **Copy these two values**:
   - **Project URL** (under "Project URL")
   - **anon public key** (under "Project API keys")

4. **Update your `.env.local`** file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Save and restart dev server: `npm start`

---

## Step 3: Run SQL Migrations

Open **SQL Editor** in Supabase (left sidebar: SQL):

### Migration 1: Create Tables & Schema

1. Click **"New Query"**
2. Paste the entire content from: `supabase/migrations/001_initial_schema.sql`
3. Click **"Run"** (or Ctrl+Enter)
4. Wait for green success message âœ…

### Migration 2: Enable Row-Level Security

1. Click **"New Query"**
2. Paste the entire content from: `supabase/migrations/002_enable_rls.sql`
3. Click **"Run"**
4. Wait for green success âœ…

### Migration 3: Create Functions & Triggers

1. Click **"New Query"**
2. Paste the entire content from: `supabase/migrations/003_functions.sql`
3. Click **"Run"**
4. Wait for green success âœ…

**All migrations are now in your Supabase database!**

---

## Step 4: Set Up Authentication

Go to **Authentication** (left sidebar):

### Enable Email/Password

1. Click **Providers** 
2. Find **Email** in the list
3. Toggle **Enable Sign-in with Email** (should be green/on)
4. Make sure **Confirm email** is OFF (for development) â€” you can toggle later

### Configure Redirect URLs

1. Go to **Authentication â†’ URL Configuration**
2. Add under **Redirect URLs**:
   ```
   exp://localhost:8081/
   com.example.carrentalapp://
   https://localhost:3000/
   ```
3. Click **Save**

---

## Step 5: Create Test Users

Go to **Authentication â†’ Users**:

1. Click **"Add User"**
2. Create staff user:
   - **Email**: `staff@car-rental-app.test`
   - **Password**: `Password123` (or any password)
   - Click **Create User**

3. Create partner user:
   - **Email**: `partner@car-rental-app.test`
   - **Password**: `Password123`
   - Click **Create User**

### Update User Roles

Go to **SQL Editor** and run:

```sql
-- Set staff user role
UPDATE profiles
SET role = 'staff'
WHERE id = (SELECT id FROM auth.users WHERE email = 'staff@car-rental-app.test');

-- Set partner user role and assign to a partner
INSERT INTO partners (name, phone, commission_rate)
VALUES ('Test Partner', '+60123456789', 20.00)
ON CONFLICT DO NOTHING
RETURNING id;

UPDATE profiles
SET role = 'partner', partner_id = (SELECT id FROM partners LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'partner@car-rental-app.test');
```

---

## Step 6: Add Test Data (Optional)

Copy and run in SQL Editor:

```sql
-- Create test cars
INSERT INTO cars (make, model, year, plate_number, color, owner_type, status)
VALUES
  ('Toyota', 'Camry', 2023, 'WXY123', 'Silver', 'company', 'available'),
  ('Honda', 'Civic', 2022, 'ABC456', 'Black', 'partner', 'available'),
  ('BMW', '3 Series', 2023, 'XYZ789', 'White', 'company', 'maintenance');

-- Create test customers
INSERT INTO customers (full_name, phone, id_number, license_number)
VALUES
  ('Ahmad Ali', '+60123456789', '123456789', 'DL001'),
  ('Sara Lee', '+60198765432', '987654321', 'DL002'),
  ('Ali Hassan', '+60187654321', '555666777', 'DL003');

-- Create test rental
INSERT INTO rentals (
  car_id, customer_id, created_by, start_date, end_date,
  rental_type, daily_rate, total_amount, deposit_amount, status
)
SELECT
  (SELECT id FROM cars WHERE plate_number = 'WXY123'),
  (SELECT id FROM customers WHERE full_name = 'Ahmad Ali'),
  (SELECT id FROM auth.users WHERE email = 'staff@car-rental-app.test'),
  '2026-06-15'::DATE,
  '2026-06-20'::DATE,
  'daily',
  150,
  750,
  300,
  'active';
```

---

## Step 7: Verify Setup

### 1. Check Tables Exist

Go to **Table Editor** (left sidebar) and verify you see:
- âœ… profiles
- âœ… partners
- âœ… cars
- âœ… customers
- âœ… rentals
- âœ… car_expenses
- âœ… general_expenses
- âœ… partner_payments

### 2. Test Login

In your app (`npm start`), try logging in:
- Email: `staff@car-rental-app.test`
- Password: `Password123`

Should redirect to **Staff Dashboard** âœ…

### 3. Test Partner Login

Try logging in with:
- Email: `partner@car-rental-app.test`
- Password: `Password123`

Should redirect to **Partner Dashboard** âœ…

---

## Step 8: Enable Real-time (Optional)

Go to **Database â†’ Replication** (left sidebar):

Click on each table and enable **realtime** if you want live updates:
- rentals
- cars
- partner_payments

---

## Troubleshooting

### "Invalid API Key"
- Check `.env.local` has correct `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Verify it matches Supabase project's anon public key
- Restart dev server after changing .env

### "User not found" on login
- Check you created test users in Step 5
- Verify their email/password in Supabase Auth â†’ Users
- Profiles might not be created â€” run this SQL:
  ```sql
  INSERT INTO profiles (id, full_name, role)
  SELECT id, raw_user_meta_data->>'full_name', 'staff'
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM profiles);
  ```

### "Permission denied" errors
- Check RLS policies were created (Step 3, Migration 2)
- Go to **Table Editor**, click a table, check "RLS Policies" tab
- Should see multiple policies for each table

### Functions not working
- Go to **SQL Editor â†’ Functions** (left sidebar)
- Verify these functions exist:
  - `is_car_available`
  - `get_car_revenue`
  - `get_car_expenses`
  - `get_general_expenses`

---

## ðŸŽ‰ Setup Complete!

Your Supabase backend is ready. Next steps in app development:

1. **Integrate login form** with actual Supabase auth
2. **Create API service layer** (auth.service.ts, rental.service.ts, etc.)
3. **Build TanStack Query hooks**
4. **Implement rental forms** with availability checking
5. **Test financial calculations**

See `SETUP.md` for app development next steps.

---

## Quick Reference

| Item | Value |
|------|-------|
| **Supabase URL** | `https://xxxx.supabase.co` (in .env.local) |
| **Anon Key** | Available in Settings â†’ API |
| **Test Staff Email** | `staff@car-rental-app.test` |
| **Test Partner Email** | `partner@car-rental-app.test` |
| **Test Password** | `Password123` |

---

## Database Schema Summary

**8 Tables:**
- `auth.users` (Supabase built-in)
- `profiles` (extends auth.users with role & partner_id)
- `partners` (partner companies with commission rates)
- `cars` (fleet with ownership & status)
- `customers` (renters)
- `rentals` (booking & rental tracking)
- `car_expenses` (maintenance costs per car)
- `general_expenses` (company-level costs)
- `partner_payments` (monthly settlements)

**Row-Level Security:** Partners only see their own data
**Currency:** All amounts in DECIMAL(10,2) â€” safe for financial math
