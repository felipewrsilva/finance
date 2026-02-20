# Finance

A personal financial management app built with Next.js. Track income, expenses, transfers, recurring bills, budgets, and multi-currency balances.

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

## Features

| Module | Route |
|---|---|
| Google OAuth login | `/login` |
| Dashboard — balance hero, income/expense/net, category breakdown, recent transactions | `/dashboard` |
| Accounts — CRUD, atomic balance updates | `/dashboard/accounts` |
| Transactions — CRUD, filters, month navigation, mark pending as paid | `/dashboard/transactions` |
| Transfer transactions — dual-balance debit/credit | transaction form |
| Recurring transactions — frequency + end date, next occurrence | `/dashboard/recurring` |
| Budgets — per-category or global spending limits | `/dashboard/budgets` |
| Reports — 6-month income/expense chart + account balance evolution | `/dashboard/reports` |
| Custom categories — user-owned, emoji icon picker | `/dashboard/settings/categories` |
| Multi-currency — per-transaction currency, exchange rates stored at write time | `/dashboard/settings/currency` |
| Export CSV | `GET /api/export/transactions` |

---

## Data Model

```
User
 ├── Account[]          (cash, bank, checking, credit card, investment)
 ├── UserCurrency[]     (enabled currencies per user)
 ├── Category[]         (system defaults + user-defined)
 ├── Transaction[]      (income, expense, transfer — balance updated atomically)
 └── Budget[]           (per-category or global spending limits)

Transaction
 ├── amount                    Decimal(14,2) in original currency
 ├── currency                  ISO 4217 code
 ├── amountInDefaultCurrency   Decimal(14,2) — for cross-currency aggregation
 ├── exchangeRateUsed          Decimal(14,6)
 ├── categoryId                String? — null for transfers
 ├── isRecurring               Boolean
 ├── frequency                 DAILY | WEEKLY | MONTHLY | YEARLY
 ├── recurrenceEnd             DateTime?
 ├── parentTransactionId       self-relation — links recurring children to origin
 └── metadata                  Json? — stores destinationAccountId for transfers
```

Key decisions:
- `Decimal(14,2)` for all money — never `Float`
- `Account.balance` updated in `prisma.$transaction` on every write — atomic, no race conditions
- `amountInDefaultCurrency` stored at write time — aggregations never hit exchange rate APIs at read time
- Recurring rules live directly on `Transaction` — no separate table
- `metadata: Json?` carries transfer destination without a schema migration

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

> `AUTH_URL` is required in development — NextAuth v5 rejects OAuth callbacks without it.

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

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
│   ├── api/
│   │   ├── auth/                  # Auth.js route handler
│   │   └── export/transactions/   # CSV export (GET ?month=&year=)
│   ├── dashboard/
│   │   ├── layout.tsx             # Sticky header, session guard, bottom nav
│   │   ├── page.tsx               # Overview
│   │   ├── accounts/
│   │   ├── transactions/
│   │   ├── recurring/
│   │   ├── budgets/
│   │   ├── reports/
│   │   └── settings/
│   │       ├── categories/        # Custom category CRUD
│   │       └── currency/
│   └── login/
├── components/
│   ├── accounts/
│   ├── budgets/
│   ├── layout/                    # BottomNav (mobile)
│   ├── reports/                   # MonthlyChart, BalanceChart (Recharts)
│   ├── settings/                  # CurrencyList, CategoryForm
│   ├── transactions/              # TransactionForm, TransactionList, MarkPaidButton
│   └── ui/
│       ├── currency-input.tsx     # Controlled, locale-aware money input
│       ├── date-picker.tsx        # Custom calendar picker, keyboard + ARIA
│       ├── submit-button.tsx      # useFormStatus pending state
│       ├── inline-confirm-button.tsx
│       ├── month-navigator.tsx
│       ├── recurring-section.tsx
│       └── type-toggle.tsx        # INCOME / EXPENSE / TRANSFER segmented control
├── modules/                       # One folder per domain: actions, schema, constants
│   ├── accounts/
│   ├── budgets/
│   ├── categories/
│   ├── currencies/
│   ├── dashboard/
│   └── transactions/
└── lib/
    ├── prisma.ts                  # Singleton with PrismaNeon adapter
    ├── exchange-rates.ts
    └── utils.ts                   # formatCurrency (memoized), getNextOccurrenceDate
| `DatePicker` controlled component | Native `<input type="date">` is inconsistent across browsers; custom calendar enforces design tokens, `aria-modal` + keyboard navigation. |
| `proxy.ts` instead of `middleware.ts` | Next.js 16 renamed the middleware entry point. |
| `prisma generate` in build script | Required for Vercel — Prisma client generated before TypeScript compilation. |
| `AUTH_URL` required in `.env.local` | NextAuth v5 validates the OAuth callback origin; missing it causes "Access Denied" locally. |
