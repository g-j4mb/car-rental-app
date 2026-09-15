# Car Rental App MVP - Setup & Getting Started

## âœ… Completed

### Phase 1: Foundation
- [x] Expo project initialized (SDK 51+)
- [x] Project structure created
- [x] Zustand stores for auth & UI state
- [x] TanStack Query configured
- [x] Supabase client setup (requires env vars)
- [x] i18n configuration (Arabic + English)
- [x] TypeScript types defined
- [x] Zod validation schemas
- [x] Financial calculation utilities (Dinero.js)
- [x] Date utilities (date-fns)
- [x] Formatters (currency, dates)

### Phase 2: Routing & Layouts
- [x] Expo Router configured
- [x] Root layout with auth guard
- [x] (auth) route group - Login screen
- [x] (staff) route group - Tab navigator with dashboard, fleet, rentals, customers, expenses, reports
- [x] (partner) route group - Tab navigator with earnings, my-cars, payments
- [x] Role-based route redirects
- [x] Language toggle (AR/EN) on all screens

### Phase 3: UI Implementation
- [x] Dashboard (staff) - 4-stat grid, due back today list
- [x] Fleet list (staff) - car cards with status badges
- [x] Rentals list (staff) - rental cards with amounts
- [x] Placeholder screens for: customers, expenses, reports
- [x] Partner dashboard - earnings summary, my cars, recent rentals
- [x] Partner my-cars screen
- [x] Partner payments screen

## ðŸ“‹ Next Steps

### 1. Supabase Setup (CRITICAL)
```bash
# Create Supabase project
# Copy credentials to .env.local
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

Run migrations:
```bash
# In supabase/ folder, create SQL migration files
# Upload to Supabase dashboard or use Supabase CLI
```

### 2. API Service Layer
- [ ] auth.service.ts - Login/logout/session
- [ ] car.service.ts - CRUD operations
- [ ] rental.service.ts - Create, return, cancel
- [ ] customer.service.ts - CRUD
- [ ] expense.service.ts - Add expenses
- [ ] report.service.ts - Financial calculations
- [ ] partner.service.ts - Partner data

### 3. Complete Screen Implementation
- [ ] New Rental form (with availability check)
- [ ] Add Car form
- [ ] Add Customer form
- [ ] Add Expense forms
- [ ] Reports screen (with month picker)
- [ ] Car detail screen
- [ ] Rental detail screen
- [ ] Customer detail screen

### 4. TanStack Query Hooks
- [ ] useRentals()
- [ ] useCars()
- [ ] useCustomers()
- [ ] useExpenses()
- [ ] useFinancials()
- [ ] usePartners()

### 5. Testing & Validation
- [ ] Login flow with Supabase
- [ ] Create rental with availability check
- [ ] Financial calculations accuracy
- [ ] RLS enforcement (partner data isolation)
- [ ] Offline behavior (TanStack Query persistence)
- [ ] i18n switching (AR â†” EN)

### 6. Polish & Deployment
- [ ] Error handling & retry logic
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Form validation feedback
- [ ] Success/error notifications
- [ ] EAS Build config
- [ ] TestFlight/Play Store prep

## ðŸ—‚ File Structure Overview

```
src/
â”œâ”€â”€ services/        â†’ Supabase API calls
â”œâ”€â”€ lib/             â†’ Utilities (financial, dates, validation, formatters)
â”œâ”€â”€ stores/          â†’ Zustand (auth, UI state)
â”œâ”€â”€ hooks/           â†’ TanStack Query hooks (to be created)
â”œâ”€â”€ components/      â†’ Reusable UI (to be expanded)
â”œâ”€â”€ types/           â†’ âœ“ Complete
â”œâ”€â”€ constants/       â†’ âœ“ Complete
â””â”€â”€ i18n/            â†’ âœ“ Complete (en.json, ar.json)

app/
â”œâ”€â”€ (auth)/          â†’ âœ“ Login screen ready
â”œâ”€â”€ (staff)/         â†’ Dashboard, Cars, Rentals, Customers, Expenses, Reports
â””â”€â”€ (partner)/       â†’ Dashboard, My Cars, Payments
```

## ðŸŽ¯ MVP Definition

**In Scope:**
- Rental creation, tracking, return, cancellation
- Monthly expense entry (car-specific + general)
- Profit calculation
- Partner commission calculation
- Staff dashboard & management screens
- Partner earnings dashboard
- Arabic + English UI

**Out of Scope (Phase 2):**
- Car photo documentation
- Advanced offline sync (WatermelonDB)
- Push notifications
- Analytics dashboards
- Admin user management UI

## ðŸš€ Dev Server

Dev server runs on `http://localhost:8081`

```bash
# Start dev server
npm start

# Open in Expo Go app (scan QR)
# Or press: i (iOS) / a (Android) / w (Web)
```

## ðŸ“ Git Workflow

```bash
# Initialize if needed
git init
git add .
git commit -m "Initial Car Rental App MVP project setup"

# Create feature branches
git checkout -b feature/rental-forms
git checkout -b feature/supabase-integration
```

## ðŸ”‘ Environment Variables

**Required in `.env.local`:**
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Get these from Supabase project settings â†’ API

## ðŸ“ž Support

See CLAUDE.md for architecture notes and design decisions.
