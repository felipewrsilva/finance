# Finance

Personal finance tracker — income, expenses, transfers, budgets, recurring bills, and multi-currency accounts.

**Live:** [finance-seven-plum.vercel.app](https://finance-seven-plum.vercel.app)

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 — App Router, Turbopack |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Auth.js v5 — Google OAuth |
| Database | PostgreSQL (Neon) |
| ORM | Prisma v7 |
| i18n | next-intl v4 — `pt-BR` / `en-US` |
| Charts | Recharts |
| Deployment | Vercel |

---

## Features

- **Dashboard** — total balance hero, monthly income/expense/net summary, category spending breakdown, recent transactions
- **Accounts** — CRUD with atomic balance updates; type-based visual identity (Cash, Checking, Bank, Credit Card, Investment); balance hero card; disabled delete when only one account remains
- **Transactions** — income, expense, transfer; month navigator, status filters, mark as paid, CSV export
- **Recurring transactions** — frequency (daily/weekly/monthly/yearly), optional end date, next occurrence display, stop action
- **Budgets** — per-category or global spending limits with progress tracking and over-budget indicator
- **Reports** — 6-month income vs expense bar chart, account balance evolution line chart, monthly breakdown table
- **Categories** — system defaults + custom user-defined categories with emoji icons
- **Multi-currency** — per-transaction currency, exchange rates stored at write time, user default currency
- **i18n** — full Portuguese (Brazil) and English (US) support across all pages and components
- **Loading skeletons** — route-level `loading.tsx` on every page for instant perceived performance
- **Responsive** — mobile-first layout with bottom nav; desktop sidebar nav; consistent `max-w-screen-lg` container

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/dashboard/   # i18n-aware routes (primary)
│   │   ├── accounts/
│   │   ├── budgets/
│   │   ├── recurring/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── transactions/
│   ├── dashboard/            # Legacy non-locale routes (redirect targets)
│   └── api/
│       ├── auth/
│       └── export/transactions/
├── components/
│   ├── accounts/             # AccountCard, AccountForm, AccountActionsDropdown
│   ├── budgets/
│   ├── layout/               # BottomNav, DesktopNav, ProfileMenu
│   ├── reports/
│   ├── settings/
│   ├── transactions/         # TransactionList, TransactionForm, TransactionFilters
│   └── ui/                   # CurrencyInput, DatePicker, InlineConfirmButton, PageHeader, StatCard, SubmitButton, …
├── modules/
│   ├── accounts/             # actions.ts, schema.ts, constants.ts (ACCOUNT_TYPE_TOKENS)
│   ├── budgets/
│   ├── categories/
│   ├── currencies/
│   ├── dashboard/
│   └── transactions/
├── i18n/                     # next-intl routing, request config
├── lib/                      # prisma.ts, utils.ts (formatCurrency, formatDate), exchange-rates.ts
└── types/
messages/
├── en-US.json
└── pt-BR.json
prisma/
├── schema.prisma
└── seed.ts
```

---

## Data Model (key models)

```prisma
Account     — id, name, type (CASH|CHECKING|BANK|CREDIT_CARD|INVESTMENT),
              balance (Decimal 14,2), currency, color, bankKey, isDefault, isActive

Transaction — id, type (INCOME|EXPENSE|TRANSFER), amount (Decimal 14,2),
              currency, exchangeRate, date, status (PAID|PENDING),
              accountId, categoryId, description, isRecurring,
              recurringFrequency, recurringEndDate, parentTransactionId

Budget      — id, name, amount (Decimal 14,2), period (WEEKLY|MONTHLY|YEARLY),
              categoryId (nullable = global), startDate, endDate

Category    — id, name, type (INCOME|EXPENSE), icon, isDefault, userId (nullable)
```

Balance updates are always atomic via `prisma.$transaction` — no balance drift.

---

## Setup

**Prerequisites:** Node.js 20+, a [Neon](https://neon.tech) PostgreSQL database, and a [Google OAuth app](https://console.cloud.google.com).

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

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script | |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | `prisma generate` + production build |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed system categories |
| `npm run db:studio` | Prisma Studio |

---

## Design Conventions

- **Components:** server components by default; `"use client"` only for interactivity (forms, hover states, dropdowns)
- **Actions:** all mutations are Next.js Server Actions with `revalidatePath` — no REST endpoints except CSV export
- **Styling:** Tailwind utility classes only; no CSS modules; design tokens defined in `constants.ts` files (e.g. `ACCOUNT_TYPE_TOKENS`)
- **i18n:** zero hardcoded user-facing strings; all keys live in `messages/`; server components use `getTranslations`, client components use `useTranslations`
- **Delete safety:** `InlineConfirmButton` (with `showAsText`) used everywhere — requires explicit confirmation, fades in on hover, never causes accidental deletion
- **Empty states:** every list has a centered empty state with icon, title, subtitle, and a primary CTA
- **Loading:** every route has a `loading.tsx` skeleton that mirrors the page layout exactly
