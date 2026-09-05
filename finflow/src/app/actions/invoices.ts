"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { invoices, invoiceLines } from "@/db/schema";
import { auth } from "@/auth";
import { requireOrgId } from "@/lib/org";
import { recordJournalEntry } from "@/lib/ledger";
import { computeInvoiceTotal } from "@/lib/invoices";

export async function createInvoiceAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const organizationId = await requireOrgId(session.user.id);

  const clientId = String(formData.get("clientId") ?? "");
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!clientId) throw new Error("Select a client");
  if (!dueDateRaw) throw new Error("Due date is required");

  const descriptions = formData.getAll("description") as string[];
  const quantities = formData.getAll("quantity") as string[];
  const unitPrices = formData.getAll("unitPrice") as string[];

  const lineInputs = descriptions
    .map((description, i) => ({
      description: description.trim(),
      quantity: Number(quantities[i]),
      unitPrice: Number(unitPrices[i]),
    }))
    .filter((l) => l.description && l.quantity > 0 && l.unitPrice > 0);

  if (lineInputs.length === 0) throw new Error("Add at least one line item");

  const total = computeInvoiceTotal(lineInputs);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(eq(invoices.organizationId, organizationId));
  const number = `INV-${String(count + 1).padStart(4, "0")}`;

  const [invoice] = await db
    .insert(invoices)
    .values({
      organizationId,
      clientId,
      number,
      status: "SENT",
      dueDate: new Date(dueDateRaw),
      notes: notes || undefined,
    })
    .returning();

  await db.insert(invoiceLines).values(
    lineInputs.map((l) => ({
      invoiceId: invoice.id,
      description: l.description,
      quantity: String(l.quantity),
      unitPrice: String(l.unitPrice),
    })),
  );

  // Accrual-basis: recognize revenue and a receivable as soon as the invoice is sent.
  await recordJournalEntry({
    organizationId,
    memo: `Invoice ${number} sent`,
    sourceType: "invoice",
    sourceId: invoice.id,
    lines: [
      { accountCode: "1100", debit: total },
      { accountCode: "4000", credit: total },
    ],
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
}

export async function markInvoicePaidAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const organizationId = await requireOrgId(session.user.id);
  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!invoiceId) throw new Error("Missing invoice id");

  const invoice = await db.query.invoices.findFirst({
    where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId)),
    with: { lines: true },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "PAID") return;

  const total = computeInvoiceTotal(invoice.lines);

  await db.update(invoices).set({ status: "PAID", paidAt: new Date() }).where(eq(invoices.id, invoiceId));

  await recordJournalEntry({
    organizationId,
    memo: `Invoice ${invoice.number} paid`,
    sourceType: "invoice",
    sourceId: invoice.id,
    lines: [
      { accountCode: "1000", debit: total },
      { accountCode: "1100", credit: total },
    ],
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
}
