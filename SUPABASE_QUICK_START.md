# Car Rental App Supabase Quick Start (10 Minutes)

## 🚀 Ultra-Fast Setup

### 1️⃣ Create Project (2 min)
```
supabase.com → New Project
Name: car-rental-app
Region: Pick yours
Password: Pick one
Wait... ⏳
```

### 2️⃣ Get Credentials (1 min)
```
Settings → API
Copy Project URL
Copy anon key
Paste in .env.local:

EXPO_PUBLIC_SUPABASE_URL=paste-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=paste-here

Save & Close
```

### 3️⃣ Run 13 SQL Migrations (7 min)
Open **SQL Editor** in Supabase:

**For each file, in order: copy entire file → Paste → Run → Done**

1. `supabase/migrations/001_initial_schema.sql` → Run ✅
2. `supabase/migrations/002_enable_rls.sql` → Run ✅
3. `supabase/migrations/003_functions.sql` → Run ✅
4. `supabase/migrations/004_fix_user_creation.sql` → Run ✅
5. `supabase/migrations/005_disable_trigger.sql` → Run ✅
6. `supabase/migrations/006_fix_permissions.sql` → Run ✅
7. `supabase/migrations/007_partners_is_active.sql` → Run ✅
8. `supabase/migrations/008_customers_is_active.sql` → Run ✅
9. `supabase/migrations/009_rental_settlement.sql` → Run ✅
10. `supabase/migrations/010_rental_times.sql` → Run ✅
11. `supabase/migrations/011_partner_login_email.sql` → Run ✅
12. `supabase/migrations/012_profile_trigger.sql` → Run ✅
13. `supabase/migrations/013_partner_portal_rls.sql` → Run ✅

### 4️⃣ Create Test Users (1 min)

Go to **Authentication → Users** → Add User:

```
Email: staff@car-rental-app.test
Password: Password123
```

Repeat:
```
Email: partner@car-rental-app.test
Password: Password123
```

### 5️⃣ Set Roles (1 min)

Go back to **SQL Editor** → New Query → Copy/Paste:

```sql
UPDATE profiles SET role = 'staff' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'staff@car-rental-app.test');

INSERT INTO partners (name, phone, commission_rate)
VALUES ('Test Partner', '+60123456789', 20.00) ON CONFLICT DO NOTHING;

UPDATE profiles SET role = 'partner', 
partner_id = (SELECT id FROM partners LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'partner@car-rental-app.test');
```

Run ✅

### 6️⃣ Test App (1 min)

```bash
npm start
# Press a (Android) or i (iOS)
# Try: staff@car-rental-app.test / Password123
# Should see Dashboard ✅
```

---

## 📝 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Staff | `staff@car-rental-app.test` | `Password123` |
| Partner | `partner@car-rental-app.test` | `Password123` |

---

## 🎯 What Happens on Login

1. User enters email/password
2. Supabase verifies credentials
3. App fetches user profile (with role)
4. Staff → `/staff/dashboard`
5. Partner → `/partner/dashboard`

---

## ✨ Ready to Code!

Your app now:
- ✅ Connects to Supabase
- ✅ Has secure database
- ✅ Has user authentication
- ✅ Has role-based access
- ✅ Can create rentals & track expenses

See `SETUP.md` for next features to build.

---

## 🆘 Still Stuck?

1. **Invalid API Key?**
   - Check `.env.local` file
   - Restart dev server: `npm start`

2. **Can't Log In?**
   - Go to Supabase → Users
   - Verify email exists
   - Check password

3. **Data Not Showing?**
   - Re-run `002_enable_rls.sql`, `006_fix_permissions.sql`, and `013_partner_portal_rls.sql`
   - Check user role is set

See `SUPABASE_SETUP.md` for full troubleshooting.
