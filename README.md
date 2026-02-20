# Finance

A personal financial management application inspired by Mobills, built with a modern, scalable stack. Full control over income, expenses, recurring bills, budgets, multi-currency tracking, and clear reports.

**Live:** [finance-seven-plum.vercel.app](https://finance-seven-plum.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Auth | Auth.js v5 (Google OAuth) |
| Database | PostgreSQL (Neon — serverless) |
| ORM | Prisma v7 |
| Validation | Zod v4 |
| Charts | Recharts |
| Deployment | Vercel |

---

## Current Status

| Module | Status | Notes |
|---|---|---|
| Google OAuth authentication | ✅ | `/login` |
| User session with DB persistence | ✅ | id, defaultCurrency, locale in session |
| Protected dashboard layout | ✅ | Sticky header + responsive nav + bottom nav |
| Accounts (CRUD + atomic balance) | ✅ | `/dashboard/accounts` |
| System categories (seeded) | ✅ | 20+ defaults, system + user-owned |
| Transactions (CRUD + atomic balance) | ✅ | `/dashboard/transactions` |
| Recurring transactions (inline) | ✅ | Embedded in TransactionForm via toggle |
| Monthly dashboard metrics | ✅ | Balance hero, income/expense/net, category breakdown |
| Budget system | ✅ | `/dashboard/budgets`, per-category or global |
| Reports (6-month bar chart) | ✅ | `/dashboard/reports` |
| Multi-currency support | ✅ | Per-transaction currency + exchange rate stored |
| Currency settings (UX refactor) | ✅ | Optimistic list, instant default swap, inline add |
| Controlled CurrencyInput component | ✅ | Live formatting, locale-aware, all money fields |
| Custom DatePicker component | ✅ | Unified calendar UI, replaces all native date inputs across forms |
| Responsive desktop layout | ✅ | lg/xl breakpoints, accessible filters and month nav |
| Loading states (route-level) | 🔜 | `loading.tsx` files not yet created |
| Form submit pending states | 🔜 | `useFormStatus` on submit buttons |
| Transfer transactions | 🔜 | Schema ready (`TRANSFER` type exists) |
| Custom user categories | 🔜 | Backend ready, no CRUD UI yet |
| Account balance evolution chart | 🔜 | Line chart per account over time |
| Export (CSV / PDF) | 🔜 | Transaction history download |

See [docs/roadmap.md](docs/roadmap.md) for the full implementation plan.

---

## Data Model

```
User
 ├── Account[]          (cash, bank, checking, credit card, investment)
 ├── UserCurrency[]     (enabled currencies per user)
 ├── Category[]         (system defaults nullable userId + user-defined)
 ├── Transaction[]      (income, expense, transfer — balance updated atomically)
 └── Budget[]           (per-category or global spending limits)

Transaction
 ├── amount             Decimal(14,2) in original currency
 ├── currency           ISO 4217 code
 ├── amountInDefaultCurrency  Decimal(14,2) — for cross-currency aggregation
 ├── exchangeRateUsed   Decimal(14,6)
 ├── isRecurring        Boolean
 ├── frequency          DAILY | WEEKLY | MONTHLY | YEARLY
 ├── recurrenceEnd      DateTime?
 ├── parentTransactionId → self-relation for recurring children
 └── metadata           Json? — tags, attachments, installments (future)
```

Key design decisions:
- `Decimal(14,2)` for all money — never `Float`, no floating-point rounding
- `Account.balance` updated atomically in `prisma.$transaction` on every write
- Recurring rules are stored directly on `Transaction` (no separate `RecurringRule` table)
- `Category.userId` is nullable — `null` = system-wide default
- `amountInDefaultCurrency` stored at write time — aggregations never touch exchange rate APIs at read time
- `parentTransactionId` self-relation groups recurring children to their origin

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A Google OAuth app ([console.cloud.google.com](https://console.cloud.google.com))

### Setup

```bash
git clone https://github.com/felipewrsilva/finance.git
cd finance
npm install
```

Create `.env.local`:

```env
AUTH_URL="http://localhost:3000"
AUTH_SECRET="your_auth_secret"
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"
DATABASE_URL="your_neon_connection_string"
```

> **Note:** `AUTH_URL` is required in development. Without it, NextAuth v5 rejects the OAuth callback with "Access Denied".

Run migrations, seed categories, and start:

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:migrate` | Run pending Prisma migrations |
| `npm run db:seed` | Seed system categories |
| `npm run db:studio` | Open Prisma Studio |

---

## Project Structure

```
src/
├── app/
│   ├── api/auth/              # Auth.js route handler
│   ├── dashboard/
│   │   ├── layout.tsx         # Sticky header, responsive nav, session guard
│   │   ├── page.tsx           # Overview: balance hero, metrics, recent transactions
│   │   ├── accounts/          # List, new, [id]/edit
│   │   ├── transactions/      # List (filters + month nav), new, [id]/edit
│   │   ├── recurring/         # Redirects to transactions (recurring is inline now)
│   │   ├── budgets/           # List, new, [id]/edit
│   │   ├── reports/           # 6-month bar chart + monthly breakdown table
│   │   └── settings/currency/ # Multi-currency preference screen
│   └── login/
├── components/
│   ├── accounts/              # AccountCard, AccountForm
│   ├── budgets/               # BudgetForm, BudgetList
│   ├── layout/                # BottomNav (mobile only)
│   ├── reports/               # MonthlyChart (Recharts)
│   ├── settings/              # CurrencyList, CurrencyRow
│   ├── transactions/          # TransactionForm, TransactionList, TransactionFilters
│   └── ui/
│       ├── currency-input.tsx  # Controlled, locale-aware money input
│       ├── date-picker.tsx     # Custom calendar picker, full keyboard + ARIA
│       ├── inline-confirm-button.tsx
│       ├── month-navigator.tsx
│       ├── recurring-section.tsx
│       └── type-toggle.tsx
├── modules/
│   ├── accounts/              # actions.ts, schema.ts, constants.ts
│   ├── budgets/               # actions.ts, schema.ts, constants.ts
│   ├── categories/            # actions.ts
│   ├── currencies/            # actions.ts, constants.ts (SUPPORTED_CURRENCIES)
│   ├── dashboard/             # actions.ts (getDashboardSummary, getMonthlyReport)
│   └── transactions/          # actions.ts, schema.ts, constants.ts
├── lib/
│   ├── prisma.ts              # Singleton with PrismaNeon adapter
│   ├── exchange-rates.ts      # Exchange rate fetching
│   └── utils.ts               # formatCurrency (memoized), getNextOccurrenceDate, ...
├── types/
│   └── next-auth.d.ts         # Extended session types (id, defaultCurrency, locale)
├── auth.ts                    # Auth.js config (Node.js runtime)
├── auth.config.ts             # Auth.js config (edge-safe, for proxy)
└── proxy.ts                   # Route protection (Next.js 16 middleware entry point)
```

---

## Key Architectural Decisions

| Decision | Rationale |
|---|---|
| `Decimal(14,2)` for all money | Avoids floating-point rounding. Never use `Float` for currency. |
| Balance updated in `prisma.$transaction` | Atomic — no race conditions between create and balance update. |
| `amountInDefaultCurrency` stored at write time | Aggregations are fast SQL — no exchange rate API calls at read time. |
| All aggregations in SQL via Prisma `groupBy` | Far faster than `reduce` over large JS arrays. |
| Recurring stored on Transaction (no separate table) | Simpler schema; self-relation `parentTransactionId` links children to origin. |
| Soft-delete accounts via `isActive` | Preserves transaction history integrity. |
| `metadata: Json?` on Transaction | Future-proof: tags, attachments, installments without schema migrations. |
| Module-per-domain structure | Each domain owns its actions, schema, constants — no cross-module DB queries. |
| `formatCurrency` memoized with Map cache | `Intl.NumberFormat` construction is expensive — one instance per (locale, currency) pair. |
| `CurrencyInput` controlled component | All money fields share one component: live formatting, locale-aware, mobile `inputMode`. |
| `DatePicker` controlled component | Native `<input type="date">` is inconsistent across browsers; custom calendar enforces design tokens, `aria-modal` + keyboard navigation. |
| `proxy.ts` instead of `middleware.ts` | Next.js 16 renamed the middleware entry point. |
| `prisma generate` in build script | Required for Vercel — Prisma client generated before TypeScript compilation. |
| `AUTH_URL` required in `.env.local` | NextAuth v5 validates the OAuth callback origin; missing it causes "Access Denied" locally. |
