# Car Rental App Supabase Setup Checklist

## 📋 Quick Setup (Follow in Order)

### ✅ Step 1: Create Supabase Project
- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Name it: `car-rental-app`
- [ ] Choose Region (closest to you)
- [ ] Set Database Password
- [ ] Wait 2-3 minutes ⏳

### ✅ Step 2: Get API Credentials
- [ ] Go to Settings → API
- [ ] Copy **Project URL** (https://...)
- [ ] Copy **anon public key**
- [ ] Paste into `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=paste-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=paste-here
```
- [ ] Save `.env.local`

### ✅ Step 3: Run SQL Migrations

**Go to SQL Editor in Supabase Dashboard.** For each migration below, in order: click "New
Query", copy the file's entire content, paste into the SQL editor, click "Run" (or Ctrl+Enter),
and wait for ✅ success before moving to the next one.

- [ ] `001_initial_schema.sql` — 8 core tables
- [ ] `002_enable_rls.sql` — Row-level security
- [ ] `003_functions.sql` — Database functions & triggers
- [ ] `004_fix_user_creation.sql` — Fixes the auto-create-profile trigger
- [ ] `005_disable_trigger.sql` — Disables that trigger (superseded by #12)
- [ ] `006_fix_permissions.sql` — Grants + RLS policies for the API roles
- [ ] `007_partners_is_active.sql` — Soft-delete flag on partners
- [ ] `008_customers_is_active.sql` — Soft-delete flag on customers
- [ ] `009_rental_settlement.sql` — Settlement fields (recalculated charge, penalty/discount)
- [ ] `010_rental_times.sql` — Start/end time on rentals (same-day re-rental)
- [ ] `011_partner_login_email.sql` — Partner login-email reference field
- [ ] `012_profile_trigger.sql` — Re-adds the profile trigger correctly
- [ ] `013_partner_portal_rls.sql` — Partner portal read policies

### ✅ Step 4: Enable Authentication

In Supabase Dashboard → Authentication:

- [ ] Click **Providers**
- [ ] Find **Email**
- [ ] Toggle **Enable Sign-in with Email** (turn ON)
- [ ] Toggle **Confirm email** (OFF for dev)
- [ ] Go to **URL Configuration**
- [ ] Add these Redirect URLs:
  ```
  exp://localhost:8081/
  ```

### ✅ Step 5: Create Test Users

In Supabase Dashboard → Authentication → Users:

#### User 1: Staff
- [ ] Click "Add User"
- [ ] Email: `staff@car-rental-app.test`
- [ ] Password: `Password123`
- [ ] Click "Create User"

#### User 2: Partner
- [ ] Click "Add User"
- [ ] Email: `partner@car-rental-app.test`
- [ ] Password: `Password123`
- [ ] Click "Create User"

#### Set User Roles

Go to **SQL Editor** and run:

```sql
UPDATE profiles
SET role = 'staff'
WHERE id = (SELECT id FROM auth.users WHERE email = 'staff@car-rental-app.test');

INSERT INTO partners (name, phone, commission_rate)
VALUES ('Test Partner', '+60123456789', 20.00)
ON CONFLICT DO NOTHING;

UPDATE profiles
SET role = 'partner', partner_id = (SELECT id FROM partners LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'partner@car-rental-app.test');
```

- [ ] Click "Run"
- [ ] Wait for ✅ success

### ✅ Step 6: Add Sample Data (Optional)

In **SQL Editor**, run:

```sql
INSERT INTO cars (make, model, year, plate_number, color, owner_type, status)
VALUES
  ('Toyota', 'Camry', 2023, 'WXY123', 'Silver', 'company', 'available'),
  ('Honda', 'Civic', 2022, 'ABC456', 'Black', 'partner', 'available');

INSERT INTO customers (full_name, phone, id_number, license_number)
VALUES
  ('Ahmad Ali', '+60123456789', '123456789', 'DL001'),
  ('Sara Lee', '+60198765432', '987654321', 'DL002');
```

- [ ] Click "Run"

### ✅ Step 7: Restart Dev Server

```bash
# Stop dev server (Ctrl+C)
npm start
```

- [ ] Dev server restarted
- [ ] No errors in console

### ✅ Step 8: Test Login

1. **Open app in Expo Go or emulator**
   - Run: `npm start`
   - Press `a` (Android) or `i` (iOS)

2. **Test Staff Login**
   - Email: `staff@car-rental-app.test`
   - Password: `Password123`
   - Click "Sign In"
   - ✅ Should see **Staff Dashboard**

3. **Test Partner Login**
   - Click logout
   - Email: `partner@car-rental-app.test`
   - Password: `Password123`
   - Click "Sign In"
   - ✅ Should see **Partner Dashboard**

---

## 🔍 Verification Checklist

### Database
- [ ] Go to Supabase → Table Editor
- [ ] See these tables:
  - [ ] profiles
  - [ ] partners
  - [ ] cars
  - [ ] customers
  - [ ] rentals
  - [ ] car_expenses
  - [ ] general_expenses
  - [ ] partner_payments

### Row Level Security
- [ ] Click each table → "RLS Policies" tab
- [ ] See multiple policies per table
- [ ] All policies are "ENABLED"

### Functions
- [ ] Go to Supabase → Functions
- [ ] See these functions:
  - [ ] is_car_available
  - [ ] get_car_revenue
  - [ ] get_car_expenses
  - [ ] get_general_expenses

### Authentication
- [ ] Go to Supabase → Authentication → Users
- [ ] See 2 test users:
  - [ ] staff@car-rental-app.test (role: staff)
  - [ ] partner@car-rental-app.test (role: partner)

---

## 🐛 Troubleshooting

### "Invalid API Key" Error
**Problem**: App shows "Invalid API Key" on login
**Solution**:
1. Check `.env.local` file exists
2. Verify credentials match Supabase Settings → API
3. Restart dev server: `npm start`

### "User not found" on Login
**Problem**: Can't log in with test users
**Solution**:
1. Go to Supabase → Authentication → Users
2. Verify email/password match what you entered
3. If missing, create them again in Step 5

### "Permission denied" Errors
**Problem**: Can't load data after login
**Solution**:
1. Go to Supabase → Table Editor
2. Click a table → "RLS Policies"
3. Check all policies are present
4. If missing, re-run `002_enable_rls.sql`, `006_fix_permissions.sql`, and `013_partner_portal_rls.sql`

### Dev Server Won't Start
**Problem**: `npm start` fails
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Need to Reset Everything
```bash
# Go to Supabase Dashboard
# Settings → Danger Zone → Reset Database
# Then re-run all 13 migrations, in order
```

---

## 📝 Credentials to Save

Save these somewhere secure:

| Item | Value |
|------|-------|
| Supabase Project URL | `https://xxxx.supabase.co` |
| Anon Key | (from Settings → API) |
| Database Password | (what you set in Step 1) |
| Test Staff Email | `staff@car-rental-app.test` |
| Test Partner Email | `partner@car-rental-app.test` |
| Test Password | `Password123` |

---

## ✅ All Done!

When all checks pass:
- ✅ Database is set up
- ✅ Authentication works
- ✅ App connects to Supabase
- ✅ Users can log in
- ✅ Role-based access works

Next: Start building features! See `SETUP.md` for next development steps.
