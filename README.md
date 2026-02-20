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
| Charts | Recharts |
| Deployment | Vercel |

---

## Features

- Dashboard — total balance, monthly summary, category breakdown, recent transactions
- Accounts — CRUD, atomic balance updates per transaction
- Transactions — income, expense, transfer; filters, month navigation, mark as paid
- Recurring transactions — frequency, end date, next occurrence display
- Budgets — per-category or global spending limits with progress tracking
- Reports — 6-month income/expense chart, account balance evolution
- Categories — system defaults + user-defined custom categories
- Multi-currency — per-transaction currency, exchange rates stored at write time
- CSV export

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
| `npm run build` | Production build |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed system categories |
| `npm run db:studio` | Prisma Studio |
