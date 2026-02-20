# Roadmap — What's Missing

> Last updated: February 20, 2026

This document tracks every planned feature and improvement not yet implemented. Items are ordered by impact and implementation dependency.

---

## ✅ Recently Completed

These items were implemented and verified with a clean `npm run build`:

| Feature | Key files |
|---|---|
| Google OAuth + session persistence | `auth.ts`, `auth.config.ts`, `proxy.ts` |
| Accounts, Transactions, Budgets, Recurring CRUD | `src/modules/*/actions.ts`, all form/list components |
| Monthly dashboard metrics | `src/modules/dashboard/actions.ts`, `src/app/dashboard/page.tsx` |
| Reports (6-month bar chart) | `src/components/reports/monthly-chart.tsx` |
| Multi-currency support | `prisma/schema.prisma`, `src/modules/currencies/` |
| `CurrencyInput` controlled component | `src/components/ui/currency-input.tsx` |
| Currency settings UX (optimistic list) | `src/components/settings/currency-list.tsx`, `currency-row.tsx` |
| `DatePicker` controlled component | `src/components/ui/date-picker.tsx` — replaces native `<input type="date">` in all 4 forms |
| Transactions page responsive desktop | `transaction-filters.tsx`, `transaction-list.tsx`, `month-navigator.tsx` |

---

## 1. Loading States

**Impact:** High — every page currently shows a blank screen while data fetches.

### 1a. Route-level `loading.tsx` (Next.js Suspense boundaries)

Create a `loading.tsx` file alongside each page. Next.js wraps the page in a `<Suspense>` automatically, showing the skeleton while the server component fetches data.

| File to create | Skeleton content |
|---|---|
| `src/app/dashboard/loading.tsx` | Balance hero card + 3 stat cards + 5 category rows + 3 recent tx rows |
| `src/app/dashboard/transactions/loading.tsx` | 3 stat pills + filter bar + 6 transaction rows |
| `src/app/dashboard/accounts/loading.tsx` | Total balance line + 3 account cards |
| `src/app/dashboard/budgets/loading.tsx` | 3 budget progress bars |
| `src/app/dashboard/reports/loading.tsx` | 2 summary cards + chart placeholder rectangle |
| `src/app/dashboard/recurring/loading.tsx` | 3 recurring row skeletons |
| `src/app/dashboard/settings/currency/loading.tsx` | 2 currency rows + add link |

**Skeleton pattern to use across all pages:**

```tsx
// Pulse shimmer utility — reuse everywhere
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}
```

### 1b. Shared `<SubmitButton />` component (`useFormStatus`)

All form submit buttons should disable and show a spinner while the server action is pending.

**File:** `src/components/ui/submit-button.tsx`

```tsx
"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, ...props }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? <Spinner /> : children}
    </button>
  );
}
```

**Apply to:**
- `TransactionForm` — "Add transaction" / "Save changes"
- `BudgetForm` — "Create budget" / "Save changes"
- `AccountForm` — "Create account" / "Save changes"
- `LoginPage` — "Continue with Google"

### 1c. `CurrencyList` pending visual (`useTransition`)

`CurrencyList` already uses `useTransition`. Wire `isPending` to dim the list while a mutation is in flight:

```tsx
const [isPending, startTransition] = useTransition();
// ...
<ul className={isPending ? "opacity-60 pointer-events-none" : ""}>
```

---

## 2. Transfer Transactions

**Impact:** High — `TRANSFER` type exists in schema and enum but is unusable from the UI.

### What's needed

- Add `type = "TRANSFER"` option to `TypeToggle` (or a dedicated separate toggle state)
- Show a **destination account** selector in `TransactionForm` when type is TRANSFER
- Extend `createTransaction` / `updateTransaction` server actions:
  - `sourceAccount.balance -= amount`
  - `destinationAccount.balance += amount`
  - Both in the same `prisma.$transaction`
  - Set `parentTransactionId` to link the two legs together
- Handle the delete case: deleting a transfer must reverse both sides atomically
- Filter transfers out of income/expense aggregations in `getDashboardSummary` and `getTransactions`

### Schema impact

No migration needed. `TRANSFER` is already in `TransactionType`. The `parentTransactionId` self-relation already exists for linking the two legs.

### Files to change

| File | Change |
|---|---|
| `src/components/ui/type-toggle.tsx` | Add TRANSFER option |
| `src/components/transactions/transaction-form.tsx` | Destination account selector (conditional) |
| `src/modules/transactions/actions.ts` | `createTransaction`, `updateTransaction`, `deleteTransaction` — transfer logic |
| `src/modules/transactions/schema.ts` | Add optional `destinationAccountId` field |
| `src/app/dashboard/transactions/page.tsx` | Ensure transfers are excluded from income/expense sums |

---

## 3. Custom User Categories

**Impact:** Medium — users are currently limited to system-seeded categories.

### What's needed

- `/dashboard/settings/categories` page (list + new + edit)
- `CategoryForm` component: name, icon (emoji picker or text), type (INCOME / EXPENSE)
- Server actions: `createCategory`, `updateCategory`, `deleteCategory` — already have `getCategories`
- Soft-delete: set a `isActive` flag (needs migration) or hard-delete with cascade check
- In `TransactionForm` and `BudgetForm`: user-created categories appear alongside system ones (already works — `getCategories` returns both)

### Schema change needed

```prisma
model Category {
  // add:
  isActive Boolean @default(true)
}
```

### Files to create / change

| File | Action |
|---|---|
| `src/app/dashboard/settings/categories/page.tsx` | Create |
| `src/app/dashboard/settings/categories/new/page.tsx` | Create |
| `src/app/dashboard/settings/categories/[id]/edit/page.tsx` | Create |
| `src/components/settings/category-form.tsx` | Create |
| `src/modules/categories/actions.ts` | Add `createCategory`, `updateCategory`, `deleteCategory` |
| `src/modules/categories/schema.ts` | Create |
| `prisma/schema.prisma` | Add `isActive` to `Category` + migration |

---

## 4. Account Balance Evolution Chart

**Impact:** Medium — the Reports page currently only shows income vs expense. Balance history is missing.

### What's needed

A line chart on `/dashboard/reports` showing each account's running balance over the last N months.

### Approach

Compute balance snapshots from transaction history:

```ts
// For each account, sum transactions up to the end of each month
SELECT account_id, DATE_TRUNC('month', date) AS month, SUM(signed_amount) AS delta
FROM transactions
GROUP BY account_id, month
ORDER BY month
```

Then compute a running total per account starting from `Account.balance` minus all transactions after the target window.

### Files to change

| File | Change |
|---|---|
| `src/modules/dashboard/actions.ts` | Add `getAccountBalanceHistory(months: number)` |
| `src/components/reports/monthly-chart.tsx` | Add a second `<LineChart>` or new `BalanceChart` component |
| `src/app/dashboard/reports/page.tsx` | Fetch balance history, render new chart |

---

## 5. Export (CSV / PDF)

**Impact:** Medium — power users want to download their data.

### What's needed

- A button on `/dashboard/transactions` — "Export"
- A route handler `GET /api/export/transactions` that:
  - Accepts `month`, `year`, `format` query params
  - Queries transactions for the authenticated user
  - Returns a CSV (simple) or PDF (via a library like `@react-pdf/renderer`)
- CSV is the MVP; PDF is a stretch goal

### Files to create

| File | Action |
|---|---|
| `src/app/api/export/transactions/route.ts` | Create — streaming CSV response |
| `src/app/dashboard/transactions/page.tsx` | Add export button |

---

## 6. Dashboard Responsive Polish

**Impact:** Low-medium — transactions page is done; dashboard and other pages need the same treatment.

Remaining pages to bring up to the `lg:max-w-5xl` responsive standard set by the layout:

| Page | Work needed |
|---|---|
| `dashboard/page.tsx` | Scale balance hero, 3-col stat cards, category list on desktop |
| `dashboard/accounts/page.tsx` | 2-col account card grid on `md+` |
| `dashboard/budgets/page.tsx` | Scale budget cards, wider progress bars |
| `dashboard/reports/page.tsx` | 2→4-col summary on `lg`, wider chart container |
| `dashboard/settings/currency/page.tsx` | Already narrow/minimal — no change needed |
| All forms (`/new`, `/edit`) | Max-width stays `max-w-lg`; no change needed |

---

## 7. Mark Recurring as Paid (Inline)

**Impact:** Low — convenience feature. Currently requires opening the edit form for each pending recurring transaction.

### What's needed

On the dashboard's "Recent transactions" list and on `/dashboard/transactions`, show a one-tap **"Mark as paid"** button for `PENDING` transactions. No page navigation.

### Approach

- Add `markTransactionPaid(id)` server action that sets `status = "PAID"` and calls `revalidatePath`
- In `TransactionList`, show a small "✓ Pay" button for pending items that calls this action directly

### Files to change

| File | Change |
|---|---|
| `src/modules/transactions/actions.ts` | Add `markTransactionPaid(id)` |
| `src/components/transactions/transaction-list.tsx` | Inline pay button for PENDING rows |
| `src/app/dashboard/page.tsx` | Same inline button in recent transactions section |

---

## Priority Order

| # | Item | Effort | Impact |
|---|---|---|---|
| 1 | Loading states (`loading.tsx` + `SubmitButton`) | S | High |
| 2 | Transfer transactions | M | High |
| 3 | Mark recurring as paid (inline) | S | Medium |
| 4 | Custom user categories | M | Medium |
| 5 | Dashboard responsive polish | S | Medium |
| 6 | Account balance evolution chart | M | Medium |
| 7 | Export CSV | M | Medium |
