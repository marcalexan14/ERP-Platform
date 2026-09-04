import { db } from "@/db";
import { accounts, journalEntries, journalLines, type accountTypeEnum } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type AccountType = (typeof accountTypeEnum.enumValues)[number];

// Standard chart of accounts created for every new organization.
// Codes are stable so application code can reference them directly
// (e.g. "1000" for Cash) without looking up IDs first.
export const STANDARD_ACCOUNTS: { code: string; name: string; type: AccountType }[] = [
  { code: "1000", name: "Cash", type: "ASSET" },
  { code: "1100", name: "Accounts Receivable", type: "ASSET" },
  { code: "2000", name: "Accounts Payable", type: "LIABILITY" },
  { code: "3000", name: "Owner's Equity", type: "EQUITY" },
  { code: "4000", name: "Sales Revenue", type: "REVENUE" },
  { code: "5000", name: "General Expenses", type: "EXPENSE" },
];

export async function seedChartOfAccounts(organizationId: string) {
  await db.insert(accounts).values(
    STANDARD_ACCOUNTS.map((a) => ({ ...a, organizationId, isSystem: true })),
  );
}

export async function getAccountByCode(organizationId: string, code: string) {
  return db.query.accounts.findFirst({
    where: and(eq(accounts.organizationId, organizationId), eq(accounts.code, code)),
  });
}

type JournalLineInput = { accountCode: string; debit?: number; credit?: number };

// Records a balanced double-entry transaction. Throws if debits != credits,
// so the ledger can never drift out of balance.
export async function recordJournalEntry(params: {
  organizationId: string;
  date?: Date;
  memo?: string;
  sourceType?: string;
  sourceId?: string;
  lines: JournalLineInput[];
}) {
  const totalDebit = params.lines.reduce((sum, l) => sum + (l.debit ?? 0), 0);
  const totalCredit = params.lines.reduce((sum, l) => sum + (l.credit ?? 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.005) {
    throw new Error(`Journal entry is unbalanced: debits ${totalDebit} != credits ${totalCredit}`);
  }

  return db.transaction(async (tx) => {
    const [entry] = await tx
      .insert(journalEntries)
      .values({
        organizationId: params.organizationId,
        date: params.date ?? new Date(),
        memo: params.memo,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
      })
      .returning();

    for (const line of params.lines) {
      const account = await getAccountByCode(params.organizationId, line.accountCode);
      if (!account) {
        throw new Error(`Unknown account code "${line.accountCode}" for organization ${params.organizationId}`);
      }
      await tx.insert(journalLines).values({
        journalEntryId: entry.id,
        accountId: account.id,
        debit: String(line.debit ?? 0),
        credit: String(line.credit ?? 0),
      });
    }

    return entry;
  });
}
