"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import { auth } from "@/auth";
import { requireOrgId } from "@/lib/org";
import { recordJournalEntry } from "@/lib/ledger";

export async function addExpenseAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const organizationId = await requireOrgId(session.user.id);

  const kind = String(formData.get("kind")) as "EXPENSE" | "INCOME";
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") ?? "");
  const categoryName = String(formData.get("category") ?? "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  let categoryId: string | undefined;
  if (categoryName) {
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.organizationId, organizationId),
        eq(categories.name, categoryName),
        eq(categories.kind, kind),
      ),
    });
    categoryId = existing
      ? existing.id
      : (
          await db
            .insert(categories)
            .values({ organizationId, name: categoryName, kind })
            .returning()
        )[0].id;
  }

  const [expense] = await db
    .insert(expenses)
    .values({
      organizationId,
      kind,
      amount: String(amount),
      description,
      categoryId,
    })
    .returning();

  // Cash-basis double entry: expenses reduce Cash, income increases it.
  await recordJournalEntry({
    organizationId,
    memo: description || (kind === "EXPENSE" ? "Expense" : "Income"),
    sourceType: "expense",
    sourceId: expense.id,
    lines:
      kind === "EXPENSE"
        ? [
            { accountCode: "5000", debit: amount },
            { accountCode: "1000", credit: amount },
          ]
        : [
            { accountCode: "1000", debit: amount },
            { accountCode: "4000", credit: amount },
          ],
  });

  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");
}
