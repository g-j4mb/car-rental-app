# Supabase Setup Files Reference

All files you need are in the project root.

## 📂 SQL Migration Files

These go into Supabase SQL Editor (copy entire file), run in order:

### 1. `supabase/migrations/001_initial_schema.sql`
**What it does:**
- Creates 8 database tables
- Adds indexes for performance
- Sets up currency as DECIMAL(10,2)

**Tables created:**
- profiles (user roles & partner assignment)
- partners (partner companies)
- cars (fleet with ownership)
- customers (renters)
- rentals (booking & tracking)
- car_expenses (maintenance costs)
- general_expenses (company costs)
- partner_payments (monthly settlements)

**Run this 1st** ✅

---

### 2. `supabase/migrations/002_enable_rls.sql`
**What it does:**
- Enables Row Level Security on all tables
- Creates security policies
- Partners only see their own data
- Staff/admin see all data

**Security enforced:**
- Partners ↔️ Only their cars/rentals/payments
- Staff/Admin ↔️ All data
- Customers ↔️ Staff only
- Expenses ↔️ Staff only

**Run this 2nd** ✅

---

### 3. `supabase/migrations/003_functions.sql`
**What it does:**
- Creates 4 database functions:
  - `is_car_available()` - Check car availability
  - `get_car_revenue()` - Calculate monthly revenue
  - `get_car_expenses()` - Calculate monthly expenses
  - `get_general_expenses()` - Calculate company expenses
- Creates triggers for `updated_at` timestamps
- Creates trigger for auto-create profile on signup

**Run this 3rd** ✅

---

### 4. `supabase/migrations/004_fix_user_creation.sql`
Fixes the auto-create-profile trigger from #3. **Run this 4th** ✅

---

### 5. `supabase/migrations/005_disable_trigger.sql`
Disables that trigger entirely — superseded later by #12. **Run this 5th** ✅

---

### 6. `supabase/migrations/006_fix_permissions.sql`
Grants base table privileges and RLS policies to the API roles (idempotent — safe to
re-run). **Run this 6th** ✅

---

### 7. `supabase/migrations/007_partners_is_active.sql`
Adds an `is_active` soft-delete flag to partners, preserving payment history & car
links. **Run this 7th** ✅

---

### 8. `supabase/migrations/008_customers_is_active.sql`
Adds an `is_active` soft-delete flag to customers, preserving rental history.
**Run this 8th** ✅

---

### 9. `supabase/migrations/009_rental_settlement.sql`
Adds settlement fields populated when a rental is returned: recalculated charge
(pro-rated by actual return date), penalty, and discount. **Run this 9th** ✅

---

### 10. `supabase/migrations/010_rental_times.sql`
Adds `start_time`/`end_time` to rentals so a car can be returned and re-rented the
same day without a false overlap. **Run this 10th** ✅

---

### 11. `supabase/migrations/011_partner_login_email.sql`
Adds a reference field recording which Supabase Auth login belongs to a partner.
**Run this 11th** ✅

---

### 12. `supabase/migrations/012_profile_trigger.sql`
Re-adds the auto-create-profile trigger correctly — `SECURITY DEFINER` with a fixed
search path, reading role/partner_id from user metadata. **Run this 12th** ✅

---

### 13. `supabase/migrations/013_partner_portal_rls.sql`
Re-asserts the partner-relevant read policies from #6 so the partner portal has
exactly the read access it needs. **Run this 13th (last)** ✅

---

## 📖 Setup Guides

### `SUPABASE_QUICK_START.md` ⚡
**5-minute ultra-fast setup**
- Copy/paste steps only
- For experienced users
- No explanations, just do it

**Best for:** Getting started fast

---

### `SUPABASE_SETUP.md` 📚
**Comprehensive guide (30 minutes)**
- Detailed step-by-step instructions
- Screenshots & what to expect
- Troubleshooting section
- Test data setup
- Verification checklist

**Best for:** First time setup, need help

---

### `CHECKLIST.md` ✅
**Interactive checkbox format**
- Copy/paste SQL snippets
- Verification checklist
- Troubleshooting quick fixes
- Credentials save template

**Best for:** Following along, tracking progress

---

## 📱 Code Files Updated

### `src/services/auth.service.ts` (NEW)
Real Supabase authentication:
- `signIn()` - Login with email/password
- `signUp()` - Register new user
- `signOut()` - Logout
- `getProfile()` - Fetch user role
- `getSession()` - Check if logged in
- Auth state change listener

**Use this in:** Login screens, app initialization

---

### `app/(auth)/login.tsx` (UPDATED)
Now uses real Supabase auth:
- Calls `authService.signIn()`
- Fetches user role from database
- Redirects based on role (staff vs partner)
- Shows loading state during login
- Displays test credentials

**Features:**
- Language toggle (AR/EN)
- Real-time validation
- Error messages
- Loading indicator

---

## 🔑 Environment Variables

### `.env.local` (You Create)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### `.env.example` (Template)
Reference file showing what variables needed

**How to get values:**
1. Go to your Supabase project
2. Settings → API
3. Copy "Project URL"
4. Copy "anon public" key
5. Paste into `.env.local`

---

## 🚦 Setup Order

**Follow these steps in order:**

```
1. Read SUPABASE_QUICK_START.md (or SUPABASE_SETUP.md for detail)
   ↓
2. Create Supabase project at supabase.com
   ↓
3. Copy credentials to .env.local
   ↓
4. Run all 13 migrations, in order (001 → 013)
   ↓
5. Create test users in Auth panel
   ↓
6. Run user setup SQL (set roles, create partner)
   ↓
7. Restart app: npm start
   ↓
8. Test login with staff@car-rental-app.test
   ↓
9. Done! 🎉
```

---

## 🔍 Quick Reference

| File | Purpose | Action |
|------|---------|--------|
| 001_initial_schema.sql | Create tables | Copy → Paste → Run in SQL Editor |
| 002_enable_rls.sql | Security policies | Copy → Paste → Run in SQL Editor |
| 003_functions.sql | Database functions | Copy → Paste → Run in SQL Editor |
| 004_fix_user_creation.sql | Fix profile trigger | Copy → Paste → Run in SQL Editor |
| 005_disable_trigger.sql | Disable that trigger | Copy → Paste → Run in SQL Editor |
| 006_fix_permissions.sql | Grants + RLS for API roles | Copy → Paste → Run in SQL Editor |
| 007_partners_is_active.sql | Soft-delete flag on partners | Copy → Paste → Run in SQL Editor |
| 008_customers_is_active.sql | Soft-delete flag on customers | Copy → Paste → Run in SQL Editor |
| 009_rental_settlement.sql | Settlement fields | Copy → Paste → Run in SQL Editor |
| 010_rental_times.sql | Start/end time on rentals | Copy → Paste → Run in SQL Editor |
| 011_partner_login_email.sql | Partner login-email field | Copy → Paste → Run in SQL Editor |
| 012_profile_trigger.sql | Re-add profile trigger correctly | Copy → Paste → Run in SQL Editor |
| 013_partner_portal_rls.sql | Partner portal read policies | Copy → Paste → Run in SQL Editor |
| auth.service.ts | Supabase auth methods | Already in code |
| login.tsx | Login screen | Updated with real auth |

---

## 💡 Key Concepts

### Row Level Security (RLS)
Enforced at **database level** — partners can only select their own cars:
```sql
-- Example: Partner tries to load all cars
SELECT * FROM cars;
-- Returns: Only their cars (filtered by RLS policy)
```

### Currency Handling
All money stored as `DECIMAL(10,2)`:
- Safe from floating-point errors
- Dinero.js handles all calculations
- No `0.1 + 0.2 !== 0.3` problems

### User Roles
- **admin** - Can do anything
- **staff** - Can create rentals, manage fleet, track expenses
- **partner** - Can only see their own cars & earnings

---

## 🎯 After Setup

Once Supabase is connected:

**Next build:**
1. Create rental form (availability check)
2. Add car/customer/expense forms
3. Build reports screen
4. Financial calculations
5. Partner dashboard enhancements

See `SETUP.md` for roadmap.

---

## ❓ FAQ

**Q: Can I use same Supabase project for multiple apps?**
A: Yes, but create separate database schemas for each app.

**Q: Can I change database password later?**
A: Yes, in Supabase Settings → Database.

**Q: How do I reset everything?**
A: Supabase Settings → Danger Zone → Reset Database. Then re-run migrations.

**Q: Do users need email verification for signup?**
A: No, we disabled it for development. Enable later in Authentication → Providers.

---

## 📞 Support

If stuck:
1. Check `CHECKLIST.md` troubleshooting section
2. Check `SUPABASE_SETUP.md` full guide
3. Verify all 13 migrations ran without errors
4. Check `.env.local` has correct credentials
5. Restart app: `npm start`
