# Car Rental App Supabase Quick Start (5 Minutes)

## ðŸš€ Ultra-Fast Setup

### 1ï¸âƒ£ Create Project (2 min)
```
supabase.com â†’ New Project
Name: car-rental-app
Region: Pick yours
Password: Pick one
Wait... â³
```

### 2ï¸âƒ£ Get Credentials (1 min)
```
Settings â†’ API
Copy Project URL
Copy anon key
Paste in .env.local:

EXPO_PUBLIC_SUPABASE_URL=paste-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=paste-here

Save & Close
```

### 3ï¸âƒ£ Run 3 SQL Files (2 min)
Open **SQL Editor** in Supabase:

**Copy entire file â†’ Paste â†’ Run â†’ Done**

1. `supabase/migrations/001_initial_schema.sql` â†’ Run âœ…
2. `supabase/migrations/002_enable_rls.sql` â†’ Run âœ…
3. `supabase/migrations/003_functions.sql` â†’ Run âœ…

### 4ï¸âƒ£ Create Test Users (1 min)

Go to **Authentication â†’ Users** â†’ Add User:

```
Email: staff@car-rental-app.test
Password: Password123
```

Repeat:
```
Email: partner@car-rental-app.test
Password: Password123
```

### 5ï¸âƒ£ Set Roles (1 min)

Go back to **SQL Editor** â†’ New Query â†’ Copy/Paste:

```sql
UPDATE profiles SET role = 'staff' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'staff@car-rental-app.test');

INSERT INTO partners (name, phone, commission_rate)
VALUES ('Test Partner', '+60123456789', 20.00) ON CONFLICT DO NOTHING;

UPDATE profiles SET role = 'partner', 
partner_id = (SELECT id FROM partners LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'partner@car-rental-app.test');
```

Run âœ…

### 6ï¸âƒ£ Test App (1 min)

```bash
npm start
# Press a (Android) or i (iOS)
# Try: staff@car-rental-app.test / Password123
# Should see Dashboard âœ…
```

---

## ðŸ“ Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Staff | `staff@car-rental-app.test` | `Password123` |
| Partner | `partner@car-rental-app.test` | `Password123` |

---

## ðŸŽ¯ What Happens on Login

1. User enters email/password
2. Supabase verifies credentials
3. App fetches user profile (with role)
4. Staff â†’ `/staff/dashboard`
5. Partner â†’ `/partner/dashboard`

---

## âœ¨ Ready to Code!

Your app now:
- âœ… Connects to Supabase
- âœ… Has secure database
- âœ… Has user authentication
- âœ… Has role-based access
- âœ… Can create rentals & track expenses

See `SETUP.md` for next features to build.

---

## ðŸ†˜ Still Stuck?

1. **Invalid API Key?**
   - Check `.env.local` file
   - Restart dev server: `npm start`

2. **Can't Log In?**
   - Go to Supabase â†’ Users
   - Verify email exists
   - Check password

3. **Data Not Showing?**
   - Run Migration 2 again (RLS)
   - Check user role is set

See `SUPABASE_SETUP.md` for full troubleshooting.
