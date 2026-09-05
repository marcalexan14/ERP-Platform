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

**Recurring transactions**: `src/lib/recurring.ts` finds every active rule whose `nextRunDate` has passed and creates the underlying expense or invoice (plus its ledger entry), then advances `nextRunDate` by one interval. Each call processes **one period per rule**, not a full catch-up of every missed period — a daily cron naturally stays current, but a rule left unattended for months needs that many ticks (or manual "Run due now" clicks) to fully backfill. There's no automatic scheduler; wire up one of:
- **Vercel Cron** — `vercel.json` already has an entry hitting `/api/cron/run-recurring` daily at 6am UTC. Set a `CRON_SECRET` env var in your Vercel project and Vercel automatically sends it as `Authorization: Bearer <value>`, which the route checks.
- **Any external cron** (cron-job.org, GitHub Actions schedule, etc.) — hit `GET /api/cron/run-recurring` with an `Authorization: Bearer <CRON_SECRET>` header yourself.
- **Manual** — the "Run due now" button on `/dashboard/recurring` runs it for just the current org, for testing/demos without any scheduler.

**File storage**: `src/lib/storage.ts` writes uploads to `public/uploads/<orgId>/` on local disk — fine for a single persistent server, but **breaks on Vercel/serverless** (ephemeral filesystem) or any multi-instance deployment. Before deploying there, swap it for S3, Vercel Blob, or Supabase Storage — the call site (`saveUploadedFile` in `expenses.ts`'s action) only needs its return shape (`fileName`, `fileUrl`, `mimeType`) to stay the same.

## Roadmap

**Phase 1 (MVP — feature-complete)**
- [x] Multi-tenant auth, roles (`OWNER/ADMIN/ACCOUNTANT/EMPLOYEE/VIEWER` defined; only OWNER assigned so far at sign-up)
- [x] Double-entry ledger + chart of accounts
- [x] Expense/income tracking with categories, wired to the ledger
- [x] Dashboard with KPI cards + revenue/expense chart
- [x] Clients CRUD
- [x] Invoicing (create/send + mark paid, wired to the ledger as accrual-basis AR/Revenue then Cash/AR). Still missing: PDF generation, multi-currency, editing/voiding
- [x] P&L / Balance Sheet / Cash Flow report pages (`src/app/dashboard/reports/page.tsx`, data layer in `reports.ts`)
- [x] Recurring transactions — `/dashboard/recurring`, generates the underlying expense/invoice + ledger entry when due. See "Recurring transactions" below for how to actually schedule it.
- [x] Receipt attachments on expenses — local disk storage under `public/uploads/`; see "File storage" below before deploying anywhere with an ephemeral filesystem. Invoices don't have an attachment UI yet, though the schema/storage helper both support it (`attachments.invoiceId`)

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
- **Base UI's `Select` needs explicit wiring for forms when the value isn't the display text.** `SelectValue` renders the raw value by default — pass a children render function (`<SelectValue>{(v) => label}</SelectValue>`) to show something else. And when values are opaque ids (like `clientId` in `invoice-form.tsx`), don't rely on the uncontrolled `name` prop alone — use `value`/`onValueChange` with your own state plus an explicit `<input type="hidden" name="..." value={state} />`. This is what `src/components/dashboard/invoice-form.tsx` does.
- **`db.transaction(async (tx) => ...)` — always query through `tx` inside the callback, never the outer `db`.** A nested query against the outer connection pool while a transaction holds a connection can deadlock under a small pool (exactly what happened in `recordJournalEntry` during development — see `findAccountByCode` in `src/lib/ledger.ts` for the fix). It fails silently as a hang, not an error, so it's easy to miss.
