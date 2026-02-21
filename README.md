# Finance

Personal finance tracker — income, expenses, transfers, investments, budgets, recurring rules, and multi-currency accounts.

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
| Validation | Zod v4 |
| Deployment | Vercel |

---

## Features

### Dashboard
- Total balance hero card across all accounts
- Monthly income / expense / net summary with current-month stats
- Category spending breakdown (top categories)
- Recent transactions list with quick status indicator

### Accounts
- Full CRUD with atomic balance updates (`prisma.$transaction` — no drift)
- Types: Cash, Checking, Bank, Credit Card, Investment — each with distinct visual identity
- Bank logo icons via `simple-icons` (`bankKey` mapping)
- Per-account currency; default account flag
- Delete guarded — cannot remove the last remaining account

### Transactions
- Types: **Income**, **Expense**, **Transfer**, **Investment**
- Transfer moves funds atomically between two accounts; excluded from income/expense aggregations and budgets
- Month navigator (prev/next) + status filter (Paid / Pending / All)
- Mark-as-paid toggle directly from the list
- **CSV export** — download all transactions for the current month via `/api/export/transactions`
- Per-transaction currency with exchange rate stored at write time

### Recurring Rules
- Rule-based recurrence engine — rules are stored independently from transactions
- Frequencies: Daily, Weekly, Monthly, Yearly; optional end date
- Each occurrence is generated as a fully independent transaction — past occurrences are never modified
- Tracks `lastGeneratedDate` to avoid duplicates even after long inactivity
- Rules can be deactivated without deleting past transactions
- Supports all transaction types including transfers (with destination account)

### Budgets
- Per-category or global (catch-all) spending limits
- Periods: Weekly, Monthly, Yearly
- Live progress bar with over-budget colour change
- Optional date range (`startDate` / `endDate`)

### Investments
- Dedicated investment portfolio page with summary stats:
  - Total principal invested
  - Current estimated value (compound growth since start date)
  - Total gain and gain %
  - 10-year projected value
- **Investment categories** — Tesouro Direto (Prefixado, Selic, IPCA+) with risk level and description
- **Automatic rate sync** — fetches latest daily yields from [Tesouro Transparente](https://www.tesourotransparente.gov.br) and stores a 12-month moving-average rate; triggered on deploy via `POST /api/investments/sync-rates`
- **Default rate auto-fill** — selecting a category pre-fills the annual interest rate from the latest stored average (`GET /api/investments/default-rate`)
- **Recurring contributions** — monthly, quarterly, or yearly top-ups modelled alongside principal
- **Compounding** — Annual or Daily
- **Growth chart** — Recharts line chart showing projected portfolio value over time
- **Projections section** — 1 / 5 / 10 / 20-year horizon cards with aggregate gain; per-investment breakdown
- **Milestones** — calculates years to reach 2×, 5×, 10× the initial principal

### Reports
- 6-month income vs. expense grouped bar chart
- Account balance evolution line chart (6-month history)
- Monthly breakdown summary (avg income, avg expense, avg net)
- Investment projections section embedded in reports (same horizon cards + growth chart)

### Categories
- System-seeded defaults for Income, Expense, and Investment types
- Full CRUD for **custom user-defined categories** — name, emoji icon, type
- Categories are shared across Transaction forms, Budget forms, and Recurring Rule forms

### Settings
- **Currencies** — add / remove currencies available for accounts and transactions (optimistic UI with `useTransition`)
- **Transaction types** — per-user toggle to show/hide Income, Expense, Transfer, and Investment in all forms
- **Categories** — create, edit, and delete custom categories; system categories are read-only

### Multi-currency
- Each account and transaction carries its own currency
- Exchange rate is captured and stored at the moment of writing (`exchangeRateUsed`)
- User has a single `defaultCurrency` used for summaries and dashboard totals
- `amountInDefaultCurrency` is pre-computed and indexed for fast aggregations

### Internationalisation
- Full **Portuguese (Brazil)** and **English (US)** support
- Zero hardcoded user-facing strings — all keys in `messages/`
- Server components use `getTranslations`; client components use `useTranslations`
- Locale stored per user and applied on every session

### UX & Performance
- **Loading skeletons** — route-level `loading.tsx` on every page; shimmer animation mirrors exact page layout
- **`SubmitButton`** — `useFormStatus`-based; disables and shows spinner while server action is pending
- **`InlineConfirmButton`** — two-step confirm (fades in on hover) used for all destructive actions
- **Empty states** — every list has a centred empty state with icon, title, subtitle, and primary CTA
- **Responsive** — mobile-first with bottom navigation bar; desktop sidebar; `max-w-screen-lg` container on all pages
- **Server Actions** — all mutations use Next.js Server Actions with `revalidatePath`; no REST endpoints except CSV export and investment rate sync

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/dashboard/        # i18n-aware routes (primary)
│   │   ├── accounts/
│   │   ├── budgets/
│   │   ├── investments/           # Portfolio overview + new/edit forms
│   │   ├── recurring/
│   │   ├── reports/
│   │   ├── settings/
│   │   │   ├── categories/        # Custom category CRUD
│   │   │   ├── currency/
│   │   │   └── transaction-types/
│   │   └── transactions/
│   ├── dashboard/                 # Non-locale routes (redirect targets)
│   └── api/
│       ├── auth/
│       ├── export/transactions/   # CSV download
│       └── investments/
│           ├── default-rate/      # GET — latest average rate for a category
│           └── sync-rates/        # POST/GET — fetch & store Tesouro Direto rates
├── components/
│   ├── accounts/                  # AccountCard, AccountForm, AccountActionsDropdown
│   ├── budgets/
│   ├── investments/               # InvestmentList, InvestmentForm, GrowthChart, ProjectionsSection
│   ├── layout/                    # BottomNav, DesktopNav, ProfileMenu
│   ├── reports/                   # MonthlyChart, BalanceChart
│   ├── settings/                  # CategoryForm, CurrencyList, CurrencyRow, TransactionTypeSettings
│   ├── transactions/              # TransactionList, TransactionForm, TransactionFilters, MarkPaidButton
│   └── ui/                        # CurrencyInput, DatePicker, InlineConfirmButton, MonthNavigator,
│                                  #   PageHeader, RecurringSection, StatCard, SubmitButton, TypeToggle
├── modules/
│   ├── accounts/                  # actions.ts, schema.ts, constants.ts (ACCOUNT_TYPE_TOKENS)
│   ├── budgets/
│   ├── categories/
│   ├── currencies/
│   ├── dashboard/
│   ├── investments/               # actions.ts, schema.ts, projections.ts, constants.ts
│   ├── transactions/
│   └── user-settings/             # enabledTransactionTypes, defaultCurrency, locale
├── i18n/                          # next-intl routing, request config
├── lib/                           # prisma.ts, utils.ts, exchange-rates.ts, tesouro-rates.ts
└── types/
messages/
├── en-US.json
└── pt-BR.json
prisma/
├── schema.prisma
├── seed.ts          # System categories + investment categories
└── seed-rates.ts    # Seed initial Tesouro Direto rate history
```

---

## Data Model (key models)

```prisma
Account              — id, name, type (CASH|CHECKING|BANK|CREDIT_CARD|INVESTMENT),
                       balance (Decimal 14,2), currency, color, bankKey, isDefault, isActive

Transaction          — id, type (INCOME|EXPENSE|TRANSFER|INVESTMENT), amount (Decimal 14,2),
                       currency, exchangeRateUsed, amountInDefaultCurrency,
                       date, status (PAID|PENDING), accountId, categoryId,
                       description, isRecurring, recurringRuleId, parentTransactionId

RecurringRule        — id, type, amount, currency, frequency (DAILY|WEEKLY|MONTHLY|YEARLY),
                       startDate, endDate, lastGeneratedDate, isActive,
                       accountId, destinationAccountId (for transfers), categoryId

Budget               — id, name, amount (Decimal 14,2), period (WEEKLY|MONTHLY|YEARLY),
                       categoryId (nullable = global), startDate, endDate

Category             — id, name, type (INCOME|EXPENSE|INVESTMENT), icon, color,
                       userId (nullable = system default), parentId (hierarchy)

Investment           — id, userId, categoryId, transactionId,
                       principalAmount, annualInterestRate, startDate, currency,
                       recurring, recurrenceInterval (MONTHLY|QUARTERLY|YEARLY),
                       recurrenceAmount, compounding (ANNUAL|DAILY),
                       status (ACTIVE|CANCELED|COMPLETED)

InvestmentCategory   — id, name, investmentType, defaultRateSource, riskLevel, description

InvestmentRateHistory — id, categoryId, sourceDate, rateAnnualPercentage, effectiveDate

UserCurrency         — userId + currency (unique pair — tracks user's active currencies)

User                 — defaultCurrency, locale,
                       enabledTransactionTypes (INCOME|EXPENSE|TRANSFER|INVESTMENT)
```

Account balance updates are always atomic via `prisma.$transaction` — no drift. Transfer legs are written together or not at all.

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
npm run db:seed        # system categories + investment categories
npm run dev
```

Optionally seed the initial Tesouro Direto rate history (or call `POST /api/investments/sync-rates` after deploy):

```bash
npx tsx prisma/seed-rates.ts
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script | |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | `prisma generate` + production build |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed system categories and investment categories |
| `npm run db:studio` | Prisma Studio |

---

## Design Conventions

- **Components:** server components by default; `"use client"` only for interactivity (forms, hover states, dropdowns)
- **Actions:** all mutations are Next.js Server Actions with `revalidatePath` — no REST endpoints except CSV export and investment rate sync
- **Styling:** Tailwind utility classes only; no CSS modules; design tokens defined in `constants.ts` files (e.g. `ACCOUNT_TYPE_TOKENS`)
- **i18n:** zero hardcoded user-facing strings; all keys live in `messages/`; server components use `getTranslations`, client components use `useTranslations`
- **Delete safety:** `InlineConfirmButton` (with `showAsText`) used everywhere — requires explicit confirmation, fades in on hover, never causes accidental deletion
- **Empty states:** every list has a centered empty state with icon, title, subtitle, and a primary CTA
- **Loading:** every route has a `loading.tsx` skeleton that mirrors the page layout exactly
- **Projections math:** compound growth uses `FV = P × (1 + r)^t`; recurring contributions sum each instalment's individual compound period; milestones use binary search for precision
