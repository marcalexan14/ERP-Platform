import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { accounts, categories, expenses, invoiceLines, invoices, journalEntries, journalLines } from "@/db/schema";
import { getAccountByCode } from "@/lib/ledger";

export async function getKpis(organizationId: string) {
  const rows = await db
    .select({
      type: accounts.type,
      debit: sql<string>`coalesce(sum(${journalLines.debit}), 0)`,
      credit: sql<string>`coalesce(sum(${journalLines.credit}), 0)`,
    })
    .from(journalLines)
    .innerJoin(accounts, eq(journalLines.accountId, accounts.id))
    .where(eq(accounts.organizationId, organizationId))
    .groupBy(accounts.type);

  let revenue = 0;
  let expense = 0;
  let cash = 0;

  for (const row of rows) {
    const debit = Number(row.debit);
    const credit = Number(row.credit);
    if (row.type === "REVENUE") revenue += credit - debit;
    if (row.type === "EXPENSE") expense += debit - credit;
    if (row.type === "ASSET") cash += debit - credit;
  }

  const outstandingRows = await db
    .select({
      invoiceId: invoices.id,
      lineTotal: sql<string>`coalesce(sum(${invoiceLines.quantity} * ${invoiceLines.unitPrice}), 0)`,
    })
    .from(invoices)
    .leftJoin(invoiceLines, eq(invoiceLines.invoiceId, invoices.id))
    .where(and(eq(invoices.organizationId, organizationId), inArray(invoices.status, ["SENT", "OVERDUE"])))
    .groupBy(invoices.id);

  const outstandingTotal = outstandingRows.reduce((sum, r) => sum + Number(r.lineTotal), 0);

  return {
    revenue,
    expense,
    netProfit: revenue - expense,
    cash,
    outstandingTotal,
  };
}

export async function getMonthlySeries(organizationId: string, months = 6) {
  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${journalEntries.date}), 'YYYY-MM')`,
      type: accounts.type,
      debit: sql<string>`coalesce(sum(${journalLines.debit}), 0)`,
      credit: sql<string>`coalesce(sum(${journalLines.credit}), 0)`,
    })
    .from(journalLines)
    .innerJoin(journalEntries, eq(journalLines.journalEntryId, journalEntries.id))
    .innerJoin(accounts, eq(journalLines.accountId, accounts.id))
    .where(
      and(
        eq(journalEntries.organizationId, organizationId),
        inArray(accounts.type, ["REVENUE", "EXPENSE"]),
      ),
    )
    .groupBy(sql`1`, accounts.type)
    .orderBy(sql`1`);

  const byMonth = new Map<string, { month: string; revenue: number; expense: number }>();
  for (const row of rows) {
    const entry = byMonth.get(row.month) ?? { month: row.month, revenue: 0, expense: 0 };
    const debit = Number(row.debit);
    const credit = Number(row.credit);
    if (row.type === "REVENUE") entry.revenue += credit - debit;
    if (row.type === "EXPENSE") entry.expense += debit - credit;
    byMonth.set(row.month, entry);
  }

  return Array.from(byMonth.values()).slice(-months);
}

type AccountBalanceRow = { code: string; name: string; type: string; debit: string; credit: string };

async function getAccountBalances(organizationId: string, types: ("ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE")[]) {
  return db
    .select({
      code: accounts.code,
      name: accounts.name,
      type: accounts.type,
      debit: sql<string>`coalesce(sum(${journalLines.debit}), 0)`,
      credit: sql<string>`coalesce(sum(${journalLines.credit}), 0)`,
    })
    .from(accounts)
    .leftJoin(journalLines, eq(journalLines.accountId, accounts.id))
    .where(and(eq(accounts.organizationId, organizationId), inArray(accounts.type, types)))
    .groupBy(accounts.code, accounts.name, accounts.type)
    .orderBy(accounts.code) as Promise<AccountBalanceRow[]>;
}

export async function getProfitAndLoss(organizationId: string) {
  const rows = await getAccountBalances(organizationId, ["REVENUE", "EXPENSE"]);

  const revenueLines = rows
    .filter((r) => r.type === "REVENUE")
    .map((r) => ({ code: r.code, name: r.name, amount: Number(r.credit) - Number(r.debit) }));
  const expenseLines = rows
    .filter((r) => r.type === "EXPENSE")
    .map((r) => ({ code: r.code, name: r.name, amount: Number(r.debit) - Number(r.credit) }));

  const totalRevenue = revenueLines.reduce((sum, l) => sum + l.amount, 0);
  const totalExpense = expenseLines.reduce((sum, l) => sum + l.amount, 0);

  return {
    revenueLines,
    expenseLines,
    totalRevenue,
    totalExpense,
    netIncome: totalRevenue - totalExpense,
  };
}

export async function getBalanceSheet(organizationId: string) {
  const rows = await getAccountBalances(organizationId, ["ASSET", "LIABILITY", "EQUITY"]);

  const assets = rows
    .filter((r) => r.type === "ASSET")
    .map((r) => ({ code: r.code, name: r.name, amount: Number(r.debit) - Number(r.credit) }));
  const liabilities = rows
    .filter((r) => r.type === "LIABILITY")
    .map((r) => ({ code: r.code, name: r.name, amount: Number(r.credit) - Number(r.debit) }));
  const equity = rows
    .filter((r) => r.type === "EQUITY")
    .map((r) => ({ code: r.code, name: r.name, amount: Number(r.credit) - Number(r.debit) }));

  const totalAssets = assets.reduce((sum, l) => sum + l.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const equityBeforeIncome = equity.reduce((sum, l) => sum + l.amount, 0);

  // Retained earnings plugs the gap so Assets = Liabilities + Equity always holds,
  // since net income isn't posted to an equity account until a closing entry.
  const { netIncome } = await getProfitAndLoss(organizationId);

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity: equityBeforeIncome + netIncome,
    retainedEarnings: netIncome,
  };
}

export async function getCashFlowSummary(organizationId: string) {
  const cashAccount = await getAccountByCode(organizationId, "1000");
  if (!cashAccount) return { byCategory: [] as { category: string; amount: number }[], netChange: 0 };

  const rows = await db
    .select({
      sourceType: journalEntries.sourceType,
      debit: sql<string>`coalesce(sum(${journalLines.debit}), 0)`,
      credit: sql<string>`coalesce(sum(${journalLines.credit}), 0)`,
    })
    .from(journalLines)
    .innerJoin(journalEntries, eq(journalLines.journalEntryId, journalEntries.id))
    .where(eq(journalLines.accountId, cashAccount.id))
    .groupBy(journalEntries.sourceType);

  const byCategory = rows.map((r) => ({
    category: r.sourceType ?? "other",
    amount: Number(r.debit) - Number(r.credit),
  }));

  const netChange = byCategory.reduce((sum, c) => sum + c.amount, 0);

  return { byCategory, netChange };
}

// This calendar month vs. the previous one, for trend badges on the dashboard.
export async function getPeriodComparison(organizationId: string) {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const rows = await db
    .select({
      isCurrent: sql<boolean>`${journalEntries.date} >= ${startOfThisMonth}`,
      type: accounts.type,
      debit: sql<string>`coalesce(sum(${journalLines.debit}), 0)`,
      credit: sql<string>`coalesce(sum(${journalLines.credit}), 0)`,
    })
    .from(journalLines)
    .innerJoin(journalEntries, eq(journalLines.journalEntryId, journalEntries.id))
    .innerJoin(accounts, eq(journalLines.accountId, accounts.id))
    .where(
      and(
        eq(journalEntries.organizationId, organizationId),
        gte(journalEntries.date, startOfLastMonth),
        lt(journalEntries.date, startOfNextMonth),
        inArray(accounts.type, ["REVENUE", "EXPENSE"]),
      ),
    )
    .groupBy(sql`1`, accounts.type);

  const current = { revenue: 0, expense: 0 };
  const previous = { revenue: 0, expense: 0 };

  for (const row of rows) {
    const bucket = row.isCurrent ? current : previous;
    const debit = Number(row.debit);
    const credit = Number(row.credit);
    if (row.type === "REVENUE") bucket.revenue += credit - debit;
    if (row.type === "EXPENSE") bucket.expense += debit - credit;
  }

  return { current, previous };
}

// null pctChange means "no prior-period data to compare against" — render as "New" rather than a bogus percentage.
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export async function getExpenseBreakdown(organizationId: string) {
  const rows = await db
    .select({
      categoryName: categories.name,
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(and(eq(expenses.organizationId, organizationId), eq(expenses.kind, "EXPENSE")))
    .groupBy(categories.name)
    .orderBy(sql`2 desc`);

  return rows
    .map((r) => ({ name: r.categoryName ?? "Uncategorized", value: Number(r.total) }))
    .filter((r) => r.value > 0);
}
