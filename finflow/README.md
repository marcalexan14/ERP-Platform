# FinFlow

A multi-tenant financial management platform for small and mid-size businesses — invoicing, expense tracking, and reporting, backed by a real double-entry ledger. Built to be sold/operated as a hosted product (e.g. via Fiverr gigs): one deployment, many client organizations.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Drizzle ORM** + **node-postgres** — chosen over Prisma because Prisma's native `schema-engine` binary is blocked by Windows Application Control / Smart App Control on this machine. Drizzle is pure TypeScript with no native binaries, so it isn't affected. If your deployment environment doesn't have that restriction, Prisma would also work fine — just isn't worth the friction here.
- **Auth.js (NextAuth v5)** — credentials (email/password) auth, JWT sessions. No OAuth providers wired up yet.
- **shadcn/ui** (Base UI primitives, not Radix — note components use a `render` prop for polymorphism, not `asChild`) + **Tailwind CSS**
- **Recharts** for dashboard charts

## Getting started

1. **Database**: point `DATABASE_URL` in `.env` (copy from `.env.example`) at any PostgreSQL 14+ instance — local, Docker, or hosted (Neon, Supabase, Railway, RDS, etc.). A tiny embedded dev Postgres was tried during scaffolding but couldn't handle Next's multi-worker dev server (each worker opens its own connection pool) — use a real Postgres instance for anything beyond a quick smoke test.
2. **Install deps**: `npm install`
3. **Push the schema**: `npm run db:push` (uses `drizzle-kit push` — no migration files, just syncs the schema directly; switch to `drizzle-kit generate` + `migrate` once you need versioned migrations for a production database)
4. **Run the app**: `npm run dev`, then visit `http://localhost:3000`

Other scripts:
- `npm run db:studio` — Drizzle Studio, a GUI for browsing/editing data
- `npm run build` — production build (also type-checks)

## Architecture notes

**Multi-tenancy**: one Postgres database, one row per tenant in `organizations`. Every domain table (`invoices`, `expenses`, `accounts`, etc.) carries an `organizationId` foreign key. `src/lib/org.ts` resolves "the current user's organization" — currently just their first membership; add an org switcher once a user can belong to more than one.

**The ledger**: `src/lib/ledger.ts` implements a real double-entry system — a chart of accounts (`accounts`) and balanced journal entries (`journalEntries` / `journalLines`). Every new organization gets a standard chart of accounts seeded (`seedChartOfAccounts`). User-facing actions like "add an expense" call `recordJournalEntry()` under the hood, which throws if debits don't equal credits. This is what makes P&L / balance sheet / cash flow reports correct instead of guessed — see `src/lib/reports.ts` for the aggregation queries.

**Auth**: `src/auth.ts` configures Auth.js with a Credentials provider — `authorize()` checks a bcrypt hash against the `users` table directly (no adapter needed since there's no OAuth). `src/proxy.ts` is Next.js 16's renamed `middleware.ts` — it gates `/dashboard/*` behind a session check.

**Sign-up flow** (`src/app/actions/auth.ts`): creates the `User`, an `Organization`, an `OWNER` `Membership`, and seeds the chart of accounts, all before signing the user in — so every account always has a working organization.

## Roadmap

**Phase 1 (MVP — in progress)**
- [x] Multi-tenant auth, roles (`OWNER/ADMIN/ACCOUNTANT/EMPLOYEE/VIEWER` defined; only OWNER assigned so far at sign-up)
- [x] Double-entry ledger + chart of accounts
- [x] Expense/income tracking with categories, wired to the ledger
- [x] Dashboard with KPI cards + revenue/expense chart
- [ ] Invoicing (create/send/track, PDF generation, multi-currency)
- [ ] P&L / Balance Sheet / Cash Flow report pages (the data layer in `reports.ts` is there; needs UI)
- [ ] Clients CRUD
- [ ] Recurring transactions (schema exists: `recurringRules`; no scheduler/UI yet)
- [ ] Receipt/invoice file attachments (schema exists: `attachments`; no upload UI yet)

**Phase 2**
- [ ] Payroll-lite (salary as recurring expense + payslip PDF — not tax-compliant payroll; that's a much bigger scope if ever needed)
- [ ] Report export (PDF/Excel)
- [ ] Due-date reminders (email)
- [ ] Per-org branding in Settings (logo, accent color — schema already supports it, `dashboard/layout.tsx` already reads `accentColor`)
- [ ] Org switcher for users in multiple organizations

**Phase 3 (paid add-ons / upsells)**
- [ ] Stripe payment collection on invoices
- [ ] Bank feed import (Plaid)
- [ ] QuickBooks/Xero export

## Known gotchas

- **Next.js 16 renamed `middleware.ts` to `proxy.ts`**, and the exported function to `proxy`. Don't reintroduce a `middleware.ts` — it won't run.
- **shadcn/ui components here use Base UI**, not Radix. Polymorphic rendering uses `render={<Link href="..." />}` instead of `asChild` + a child element. If you copy a shadcn snippet from older docs/tutorials using `asChild`, translate it.
- **Server Actions require real browser JS** to redirect after `signIn()`/`redirect()` — if you're scripting form submissions (e.g. Playwright), submit via the real button, not a synthetic `.click()` on a detached reference.
