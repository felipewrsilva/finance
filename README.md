# Finance

A personal financial management application inspired by Mobills, built with a modern, scalable stack. The goal is to give users full control over their financial life — tracking income, expenses, recurring bills, budgets, and generating clear reports.

Live: [finance-seven-plum.vercel.app](https://finance-seven-plum.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Auth.js v5 (Google OAuth) |
| Database | PostgreSQL (Neon — serverless) |
| ORM | Prisma v7 |
| Validation | Zod v4 |
| Deployment | Vercel |

---

## Current Status

| Module | Status |
|---|---|
| Google OAuth authentication | ✅ Complete |
| User session with DB persistence | ✅ Complete |
| Protected dashboard layout | ✅ Complete |
| Accounts (CRUD + balance) | ✅ Complete |
| Categories | 🔜 Planned |
| Transactions (income/expense) | 🔜 Planned |
| Recurring transactions | 🔜 Planned |
| Monthly dashboard summary | 🔜 Planned |
| Budget system | 🔜 Planned |
| Reports | 🔜 Planned |

---

## Data Model

The core schema is already defined and migrated:

```
User
 ├── Account[]          (cash, bank, credit card, investment)
 ├── Category[]         (system defaults + user-defined)
 ├── Transaction[]      (income, expense, transfer)
 └── RecurringRule[]    (recurring bills and income)
```

Key design decisions:
- `amount` stored as `Decimal(14,2)` — never `Float`, no floating-point rounding
- `balance` on `Account` is updated on every transaction write
- `RecurringRule` stores a JSON template; each occurrence becomes a real `Transaction`
- `Category.userId` is nullable — `null` means system-wide default
- `Transaction.metadata` is a `Json?` field for future extensibility (tags, attachments)

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
AUTH_SECRET="your_auth_secret"
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"
DATABASE_URL="your_neon_connection_string"
```

Run migrations and start:

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── api/auth/         # Auth.js route handler
│   ├── dashboard/        # Protected pages (layout, accounts, etc.)
│   └── login/            # Public login page
├── components/
│   └── accounts/         # AccountCard, AccountForm
├── modules/
│   └── accounts/         # actions.ts, schema.ts, constants.ts
├── lib/
│   └── prisma.ts         # Prisma singleton with Neon adapter
├── types/
│   └── next-auth.d.ts    # Extended session types
├── auth.ts               # Auth.js config (full, Node.js runtime)
├── auth.config.ts        # Auth.js config (edge-safe, for proxy)
└── proxy.ts              # Next.js 16 route protection (replaces middleware)
```

---

## Implementation Plan — Transaction System

### Phase 1 — Categories

**Goal:** seed default system categories and allow user-defined ones.

**Seed data (system defaults):**

| Income | Expense |
|---|---|
| Salary | Housing |
| Freelance | Food |
| Investment returns | Transport |
| Other income | Health |
| | Education |
| | Entertainment |
| | Clothing |
| | Other expense |

**Implementation:**
- `prisma/seed.ts` — seed script for default categories
- `src/modules/categories/actions.ts` — `getCategories`, `createCategory`, `deleteCategory`
- No dedicated page needed initially — categories are selected inside transaction forms

---

### Phase 2 — Transactions (Core)

**Goal:** record income and expenses with account + category + date.

**CRUD operations:**
- `createTransaction(data)` — creates transaction, updates `Account.balance` atomically in a Prisma `$transaction`
- `updateTransaction(id, data)` — reverses old balance effect, applies new one
- `deleteTransaction(id)` — reverses balance, soft-deletes or hard-deletes
- `getTransactions(filters)` — paginated, filtered by period / type / category / account / status

**Filters:**
```ts
type TransactionFilters = {
  month: number;       // 1–12
  year: number;
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  status?: TransactionStatus;
}
```

**Balance update rule:**
- `INCOME` → `balance += amount`
- `EXPENSE` → `balance -= amount`
- `TRANSFER` → source `balance -= amount`, destination `balance += amount`

**Pages:**
- `/dashboard/transactions` — list with filters, grouped by date
- `/dashboard/transactions/new` — create form
- `/dashboard/transactions/[id]/edit` — edit form

---

### Phase 3 — Recurring Transactions

**Goal:** define recurring rules (monthly bills, salary) and generate pending occurrences automatically.

**RecurringRule → Transaction flow:**
1. User creates a recurring rule (e.g. "Rent, R$2.000, monthly, 1st day")
2. On each month's first load, a background check generates `PENDING` transactions for all active rules in the current month
3. User marks each as `PAID` with one click, optionally editing the amount

**Generation strategy:**
- Lazy generation on dashboard load (no cron needed for MVP)
- Check: `Transaction` with `recurringRuleId = rule.id` and `date` in current month exists?
- If not → create it with `status: PENDING`, `amount` and `categoryId` from `rule.templateData`

**Pages:**
- `/dashboard/recurring` — list active rules, toggle on/off
- Inline "mark as paid" on dashboard pending list

---

### Phase 4 — Dashboard Metrics

**Goal:** monthly financial overview on the main dashboard.

**Metrics to compute (per month, per user):**

```ts
type MonthlySummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;           // income - expense
  pendingExpenses: number;   // sum of PENDING EXPENSE transactions
  expenseByCategory: { categoryId: string; name: string; total: number }[];
  incomeByCategory:  { categoryId: string; name: string; total: number }[];
  dailyExpenses: { date: string; total: number }[];  // for sparkline chart
}
```

**Implementation:**
- Single Prisma query with `groupBy` for category breakdown
- All aggregation in SQL, not in JS
- Results cached with `unstable_cache` keyed by `userId + month + year`
- Invalidated on every `createTransaction` / `updateTransaction` / `deleteTransaction`

**UI components:**
- Summary cards: Income / Expense / Net balance / Pending
- Expense by category: horizontal bar chart (no external lib needed — pure CSS)
- Pending recurring list with "Mark as paid" button

---

### Phase 5 — Budget System

**Goal:** set monthly spending limits per category and track progress.

**New model:**
```prisma
model Budget {
  id         String   @id @default(cuid())
  userId     String
  categoryId String
  amount     Decimal  @db.Decimal(14, 2)
  month      Int      // 1–12
  year       Int
  createdAt  DateTime @default(now())

  user     User     @relation(...)
  category Category @relation(...)

  @@unique([userId, categoryId, month, year])
  @@map("budgets")
}
```

**Logic:**
- Budget progress = `spent / limit * 100`
- Status: `safe` (< 75%), `warning` (75–99%), `exceeded` (≥ 100%)
- Shown as progress bars on dashboard and a dedicated `/dashboard/budget` page

---

### Phase 6 — Reports

**Goal:** give users insight across longer time periods.

**Report types:**
- Monthly income vs. expense — last 6 or 12 months (bar chart)
- Category ranking — top N expense categories over a period
- Account balance evolution — line chart per account
- Annual summary — income / expense / savings per month in a table

**Implementation:**
- Prisma aggregation queries with `groupBy` on `date` range
- Recharts for visualizations (bar, line)
- Date range picker (month/year selectors, no heavy datepicker lib)
- `/dashboard/reports` page

---

### Development Order

```
1. Seed categories (prisma/seed.ts)
2. Category server actions + getCategories
3. Transaction CRUD + balance update (atomic)
4. Transaction list page with month filter
5. Transaction new/edit form
6. Recurring rule CRUD
7. Recurring occurrence generator (lazy, on dashboard load)
8. Dashboard metrics query + summary cards
9. Category breakdown chart
10. Budget model + migration
11. Budget CRUD + progress UI
12. Reports page + Recharts
```

---

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| `Decimal(14,2)` for all money | Avoids floating-point errors. Never use `Float` for currency. |
| Balance updated in `$transaction` | Atomic — no race conditions between create and balance update. |
| All aggregations in SQL | `groupBy` in Prisma is far faster than `reduce` in JS over large datasets. |
| `unstable_cache` for dashboard metrics | Avoids re-running heavy queries on every render. Invalidate on mutation. |
| Lazy recurring generation | No cron job needed at MVP scale. Generate on first dashboard load of the month. |
| Soft-delete accounts via `isActive` | Preserves transaction history integrity. |
| `metadata: Json?` on Transaction | Future-proof: tags, attachments, installment info — no schema migration needed. |
| Module-per-domain structure | Each domain owns its actions, schema, and constants. No cross-module DB queries. |


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# finance
