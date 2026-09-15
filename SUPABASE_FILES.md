# Supabase Setup Files Reference

All files you need are in the project root.

## ðŸ“‚ SQL Migration Files

These go into Supabase SQL Editor (copy entire file):

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

**Run this FIRST** âœ…

---

### 2. `supabase/migrations/002_enable_rls.sql`
**What it does:**
- Enables Row Level Security on all tables
- Creates security policies
- Partners only see their own data
- Staff/admin see all data

**Security enforced:**
- Partners â†”ï¸ Only their cars/rentals/payments
- Staff/Admin â†”ï¸ All data
- Customers â†”ï¸ Staff only
- Expenses â†”ï¸ Staff only

**Run this SECOND** âœ…

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

**Run this THIRD** âœ…

---

## ðŸ“– Setup Guides

### `SUPABASE_QUICK_START.md` âš¡
**5-minute ultra-fast setup**
- Copy/paste steps only
- For experienced users
- No explanations, just do it

**Best for:** Getting started fast

---

### `SUPABASE_SETUP.md` ðŸ“š
**Comprehensive guide (30 minutes)**
- Detailed step-by-step instructions
- Screenshots & what to expect
- Troubleshooting section
- Test data setup
- Verification checklist

**Best for:** First time setup, need help

---

### `CHECKLIST.md` âœ…
**Interactive checkbox format**
- Copy/paste SQL snippets
- Verification checklist
- Troubleshooting quick fixes
- Credentials save template

**Best for:** Following along, tracking progress

---

## ðŸ“± Code Files Updated

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

## ðŸ”‘ Environment Variables

### `.env.local` (You Create)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### `.env.example` (Template)
Reference file showing what variables needed

**How to get values:**
1. Go to your Supabase project
2. Settings â†’ API
3. Copy "Project URL"
4. Copy "anon public" key
5. Paste into `.env.local`

---

## ðŸš¦ Setup Order

**Follow these steps in order:**

```
1. Read SUPABASE_QUICK_START.md (or SUPABASE_SETUP.md for detail)
   â†“
2. Create Supabase project at supabase.com
   â†“
3. Copy credentials to .env.local
   â†“
4. Run Migration 001 (create tables)
   â†“
5. Run Migration 002 (enable RLS security)
   â†“
6. Run Migration 003 (create functions)
   â†“
7. Create test users in Auth panel
   â†“
8. Run user setup SQL (set roles, create partner)
   â†“
9. Restart app: npm start
   â†“
10. Test login with staff@car-rental-app.test
   â†“
11. Done! ðŸŽ‰
```

---

## ðŸ” Quick Reference

| File | Purpose | Action |
|------|---------|--------|
| 001_initial_schema.sql | Create tables | Copy â†’ Paste â†’ Run in SQL Editor |
| 002_enable_rls.sql | Security policies | Copy â†’ Paste â†’ Run in SQL Editor |
| 003_functions.sql | Database functions | Copy â†’ Paste â†’ Run in SQL Editor |
| auth.service.ts | Supabase auth methods | Already in code |
| login.tsx | Login screen | Updated with real auth |

---

## ðŸ’¡ Key Concepts

### Row Level Security (RLS)
Enforced at **database level** â€” partners can only select their own cars:
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

## ðŸŽ¯ After Setup

Once Supabase is connected:

**Next build:**
1. Create rental form (availability check)
2. Add car/customer/expense forms
3. Build reports screen
4. Financial calculations
5. Partner dashboard enhancements

See `SETUP.md` for roadmap.

---

## â“ FAQ

**Q: Can I use same Supabase project for multiple apps?**
A: Yes, but create separate database schemas for each app.

**Q: Can I change database password later?**
A: Yes, in Supabase Settings â†’ Database.

**Q: How do I reset everything?**
A: Supabase Settings â†’ Danger Zone â†’ Reset Database. Then re-run migrations.

**Q: Do users need email verification for signup?**
A: No, we disabled it for development. Enable later in Authentication â†’ Providers.

---

## ðŸ“ž Support

If stuck:
1. Check `CHECKLIST.md` troubleshooting section
2. Check `SUPABASE_SETUP.md` full guide
3. Verify all 3 migrations ran without errors
4. Check `.env.local` has correct credentials
5. Restart app: `npm start`
