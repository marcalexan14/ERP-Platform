import { and, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { recurringRules, expenses, invoices, invoiceLines } from "@/db/schema";
import { recordJournalEntry } from "@/lib/ledger";

export function computeNextRunDate(current: Date, frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY") {
  const next = new Date(current);
  switch (frequency) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

// Processes every active rule whose nextRunDate has passed, creating the
// underlying expense/invoice + ledger entry and advancing nextRunDate.
// Pass organizationId to scope to one org (manual "run now"); omit to run
// across all orgs (the real cron entry point).
export async function runDueRecurringRules(organizationId?: string) {
  const dueRules = await db.query.recurringRules.findMany({
    where: and(
      eq(recurringRules.active, true),
      lte(recurringRules.nextRunDate, new Date()),
      organizationId ? eq(recurringRules.organizationId, organizationId) : undefined,
    ),
  });

  const results: { ruleId: string; kind: string; createdId: string }[] = [];

  for (const rule of dueRules) {
    const amount = Number(rule.amount);

    if (rule.kind === "EXPENSE") {
      const [expense] = await db
        .insert(expenses)
        .values({
          organizationId: rule.organizationId,
          categoryId: rule.categoryId ?? undefined,
          kind: "EXPENSE",
          amount: String(amount),
          description: rule.description ?? undefined,
        })
        .returning();

      await recordJournalEntry({
        organizationId: rule.organizationId,
        memo: rule.description ?? "Recurring expense",
        sourceType: "recurring_expense",
        sourceId: expense.id,
        lines: [
          { accountCode: "5000", debit: amount },
          { accountCode: "1000", credit: amount },
        ],
      });

      results.push({ ruleId: rule.id, kind: "EXPENSE", createdId: expense.id });
    } else if (rule.kind === "INVOICE" && rule.clientId) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(invoices)
        .where(eq(invoices.organizationId, rule.organizationId));
      const number = `INV-${String(count + 1).padStart(4, "0")}`;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const [invoice] = await db
        .insert(invoices)
        .values({
          organizationId: rule.organizationId,
          clientId: rule.clientId,
          number,
          status: "SENT",
          dueDate,
          notes: rule.description ?? undefined,
        })
        .returning();

      await db.insert(invoiceLines).values({
        invoiceId: invoice.id,
        description: rule.description ?? "Recurring invoice",
        quantity: "1",
        unitPrice: String(amount),
      });

      await recordJournalEntry({
        organizationId: rule.organizationId,
        memo: `Invoice ${number} sent (recurring)`,
        sourceType: "invoice",
        sourceId: invoice.id,
        lines: [
          { accountCode: "1100", debit: amount },
          { accountCode: "4000", credit: amount },
        ],
      });

      results.push({ ruleId: rule.id, kind: "INVOICE", createdId: invoice.id });
    }

    await db
      .update(recurringRules)
      .set({ nextRunDate: computeNextRunDate(rule.nextRunDate, rule.frequency) })
      .where(eq(recurringRules.id, rule.id));
  }

  return results;
}
