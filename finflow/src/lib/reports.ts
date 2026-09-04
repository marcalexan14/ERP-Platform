import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { accounts, invoiceLines, invoices, journalEntries, journalLines } from "@/db/schema";

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
