# ðŸš€ START HERE â€” Supabase Setup Guide

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

1. **Go to**: Settings â†’ API (in Supabase dashboard)
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

### Step 3: Run 3 SQL Migrations (5 minutes)

Go to **SQL Editor** in your Supabase project (left sidebar).

**For each migration file below:**
1. Click "New Query"
2. Open the file from your project folder
3. Copy **entire content**
4. Paste into SQL editor
5. Click "Run" (or Ctrl+Enter)
6. Wait for green âœ… success message

**Run in this order:**

#### Migration 1:
```
File: supabase/migrations/001_initial_schema.sql
Time: ~10 seconds
Creates: 8 database tables
```

#### Migration 2:
```
File: supabase/migrations/002_enable_rls.sql
Time: ~15 seconds
Adds: Security rules (partners only see their data)
```

#### Migration 3:
```
File: supabase/migrations/003_functions.sql
Time: ~10 seconds
Creates: 4 database functions for calculations
```

**All done!** âœ…

---

## Wait... That's It?

**No, but close!** You also need test users (1 more minute):

### Create Test Users (1 minute)

Go to **Authentication â†’ Users** (left sidebar in Supabase):

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
4. Wait for âœ… success

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
5. **Should see Staff Dashboard** âœ…

### Test partner login:
1. Click logout (top right)
2. Email: `partner@car-rental-app.test`
3. Password: `Password123`
4. Click "Sign In"
5. **Should see Partner Dashboard** âœ…

---

## âœ… Congratulations!

You now have:
- âœ… Supabase database connected
- âœ… User authentication working
- âœ… Role-based access (staff vs partner)
- âœ… 8 database tables for tracking rentals, expenses, profits
- âœ… Security rules enforced

Your app can now:
- ðŸ” Login with real credentials
- ðŸ“Š Track rentals & expenses
- ðŸ’° Calculate profits
- ðŸ‘¥ Manage partners
- ðŸ“± Show different screens based on user role

---

## ðŸ“š Need More Help?

Choose based on your needs:

| Document | Best For |
|----------|----------|
| **SUPABASE_QUICK_START.md** | Just copy/paste commands fast âš¡ |
| **SUPABASE_SETUP.md** | Detailed step-by-step with explanations ðŸ“– |
| **CHECKLIST.md** | Track your progress with checkboxes âœ… |
| **SUPABASE_FILES.md** | Understand what each file does ðŸ” |

---

## ðŸŽ¯ What's Next?

Once Supabase is set up:

1. **Build rental forms** - Let staff create rentals
2. **Add cars & customers** - CRUD screens
3. **Track expenses** - Monthly cost entry
4. **Financial reports** - P&L calculations
5. **Partner settlements** - Monthly payout management

See `SETUP.md` for roadmap.

---

## ðŸ’¡ Important Reminders

1. **`.env.local` is in `.gitignore`** - Don't commit credentials to git
2. **Save your database password** - You'll need it if resetting
3. **Test users use fake emails** - OK for development (won't receive emails)
4. **Supabase free tier** - Great for MVP, includes 500MB database

---

## ðŸ†˜ Troubleshooting Quick Fix

| Problem | Fix |
|---------|-----|
| "Invalid API Key" | Check `.env.local` matches Supabase Settings â†’ API |
| "User not found" | Create users in Authentication â†’ Users panel |
| "Permission denied" | Re-run Migration 2 (RLS policies) |
| "Can't log in" | Verify email/password in Supabase Users |
| Server won't start | Run: `npm install` then `npm start` |

---

## ðŸ“ž Need Help?

1. Re-read this file
2. Check the appropriate guide above
3. Verify all 3 migrations ran without errors
4. Verify test users exist in Supabase Auth panel
5. Verify `.env.local` has credentials
6. Restart: `npm start`

---

## Ready? Let's Go! ðŸš€

**Start with Step 1 above â†’ Supabase project**

Questions? Check the guide files. All setup steps are documented!
