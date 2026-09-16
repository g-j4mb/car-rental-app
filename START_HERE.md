# 🚀 START HERE — Supabase Setup Guide

## What You Need to Do (3 Steps)

### Step 1: Create Supabase Project (2 minutes)

1. **Go to**: https://supabase.com/dashboard
2. **Click**: "New Project"
3. **Fill in**:
   - Project name: `car-rental-app`
   - Database password: Create one (save it!)
   - Region: Pick yours
4. **Wait**: 2-3 minutes for it to initialize

---

### Step 2: Get Credentials & Update `.env.local` (1 minute)

1. **Go to**: Settings → API (in Supabase dashboard)
2. **Copy these TWO values**:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - anon public key

3. **Open this file**: `.env.local` in the project root

4. **Update with your values**:
```env
EXPO_PUBLIC_SUPABASE_URL=https://paste-your-url-here.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
```

5. **Save the file**

---

### Step 3: Run 13 SQL Migrations (10 minutes)

Go to **SQL Editor** in your Supabase project (left sidebar).

**For each migration file below, in order:**
1. Click "New Query"
2. Open the file from your project folder
3. Copy **entire content**
4. Paste into SQL editor
5. Click "Run" (or Ctrl+Enter)
6. Wait for green ✅ success message

**Run in this order:**

| # | File | Adds |
|---|---|---|
| 1 | `001_initial_schema.sql` | 8 database tables |
| 2 | `002_enable_rls.sql` | Row-level security (partners only see their data) |
| 3 | `003_functions.sql` | 4 database functions for calculations |
| 4 | `004_fix_user_creation.sql` | Fixes the auto-create-profile trigger |
| 5 | `005_disable_trigger.sql` | Disables that trigger (superseded by #12 below) |
| 6 | `006_fix_permissions.sql` | Grants + RLS policies for the API roles |
| 7 | `007_partners_is_active.sql` | Soft-delete flag on partners |
| 8 | `008_customers_is_active.sql` | Soft-delete flag on customers |
| 9 | `009_rental_settlement.sql` | Settlement fields (recalculated charge, penalty/discount) |
| 10 | `010_rental_times.sql` | Start/end time on rentals (same-day re-rental) |
| 11 | `011_partner_login_email.sql` | Partner login-email reference field |
| 12 | `012_profile_trigger.sql` | Re-adds the profile trigger correctly |
| 13 | `013_partner_portal_rls.sql` | Partner portal read policies |

**All done!** ✅

---

## Wait... That's It?

**No, but close!** You also need test users (1 more minute):

### Create Test Users (1 minute)

Go to **Authentication → Users** (left sidebar in Supabase):

#### Create User 1: Staff
1. Click "Add User"
2. Email: `staff@car-rental-app.test`
3. Password: `Password123`
4. Click "Create User"

#### Create User 2: Partner
1. Click "Add User"
2. Email: `partner@car-rental-app.test`
3. Password: `Password123`
4. Click "Create User"

---

### Set Their Roles (1 minute)

Go back to **SQL Editor** in Supabase:

1. Click "New Query"
2. Copy and paste this SQL:

```sql
UPDATE profiles SET role = 'staff' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'staff@car-rental-app.test');

INSERT INTO partners (name, phone, commission_rate)
VALUES ('Test Partner', '+60123456789', 20.00) ON CONFLICT DO NOTHING;

UPDATE profiles SET role = 'partner', 
partner_id = (SELECT id FROM partners LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'partner@car-rental-app.test');
```

3. Click "Run"
4. Wait for ✅ success

---

## Test Your Setup (2 minutes)

### Restart the app:
```bash
# Stop dev server (if running): Ctrl+C
npm start
```

### Test login:
1. Press `a` (Android) or `i` (iOS) to open in emulator/Expo Go
2. Email: `staff@car-rental-app.test`
3. Password: `Password123`
4. Click "Sign In"
5. **Should see Staff Dashboard** ✅

### Test partner login:
1. Click logout (top right)
2. Email: `partner@car-rental-app.test`
3. Password: `Password123`
4. Click "Sign In"
5. **Should see Partner Dashboard** ✅

---

## ✅ Congratulations!

You now have:
- ✅ Supabase database connected
- ✅ User authentication working
- ✅ Role-based access (staff vs partner)
- ✅ 8 database tables for tracking rentals, expenses, profits
- ✅ Security rules enforced

Your app can now:
- 🔐 Login with real credentials
- 📊 Track rentals & expenses
- 💰 Calculate profits
- 👥 Manage partners
- 📱 Show different screens based on user role

---

## 📚 Need More Help?

Choose based on your needs:

| Document | Best For |
|----------|----------|
| **SUPABASE_QUICK_START.md** | Just copy/paste commands fast ⚡ |
| **SUPABASE_SETUP.md** | Detailed step-by-step with explanations 📖 |
| **CHECKLIST.md** | Track your progress with checkboxes ✅ |
| **SUPABASE_FILES.md** | Understand what each file does 🔍 |

---

## 🎯 What's Next?

Once Supabase is set up:

1. **Build rental forms** - Let staff create rentals
2. **Add cars & customers** - CRUD screens
3. **Track expenses** - Monthly cost entry
4. **Financial reports** - P&L calculations
5. **Partner settlements** - Monthly payout management

See `SETUP.md` for roadmap.

---

## 💡 Important Reminders

1. **`.env.local` is in `.gitignore`** - Don't commit credentials to git
2. **Save your database password** - You'll need it if resetting
3. **Test users use fake emails** - OK for development (won't receive emails)
4. **Supabase free tier** - Great for MVP, includes 500MB database

---

## 🆘 Troubleshooting Quick Fix

| Problem | Fix |
|---------|-----|
| "Invalid API Key" | Check `.env.local` matches Supabase Settings → API |
| "User not found" | Create users in Authentication → Users panel |
| "Permission denied" | Re-run `002`, `006`, and `013` (RLS policies) |
| "Can't log in" | Verify email/password in Supabase Users |
| Server won't start | Run: `npm install` then `npm start` |

---

## 📞 Need Help?

1. Re-read this file
2. Check the appropriate guide above
3. Verify all 13 migrations ran without errors
4. Verify test users exist in Supabase Auth panel
5. Verify `.env.local` has credentials
6. Restart: `npm start`

---

## Ready? Let's Go! 🚀

**Start with Step 1 above → Supabase project**

Questions? Check the guide files. All setup steps are documented!
