"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { recurringRules } from "@/db/schema";
import { auth } from "@/auth";
import { requireOrgId } from "@/lib/org";
import { runDueRecurringRules } from "@/lib/recurring";
import { eq } from "drizzle-orm";

export async function createRecurringRuleAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const organizationId = await requireOrgId(session.user.id);

  const kind = String(formData.get("kind") ?? "") as "INVOICE" | "EXPENSE";
  const frequency = String(formData.get("frequency") ?? "") as
    | "WEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "YEARLY";
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") ?? "").trim();
  const startDateRaw = String(formData.get("startDate") ?? "");
  const clientId = String(formData.get("clientId") ?? "").trim();

  if (!kind) throw new Error("Select a type");
  if (!frequency) throw new Error("Select a frequency");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be a positive number");
  if (!startDateRaw) throw new Error("Start date is required");
  if (kind === "INVOICE" && !clientId) throw new Error("Select a client for a recurring invoice");

  await db.insert(recurringRules).values({
    organizationId,
    kind,
    clientId: kind === "INVOICE" ? clientId : undefined,
    frequency,
    nextRunDate: new Date(startDateRaw),
    amount: String(amount),
    description: description || undefined,
  });

  revalidatePath("/dashboard/recurring");
}

export async function toggleRecurringRuleAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const organizationId = await requireOrgId(session.user.id);
  const ruleId = String(formData.get("ruleId") ?? "");
  const nextActive = formData.get("nextActive") === "true";
  if (!ruleId) throw new Error("Missing rule id");

  const rule = await db.query.recurringRules.findFirst({ where: eq(recurringRules.id, ruleId) });
  if (!rule || rule.organizationId !== organizationId) throw new Error("Rule not found");

  await db.update(recurringRules).set({ active: nextActive }).where(eq(recurringRules.id, ruleId));

  revalidatePath("/dashboard/recurring");
}

export async function runRecurringNowAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const organizationId = await requireOrgId(session.user.id);
  await runDueRecurringRules(organizationId);

  revalidatePath("/dashboard/recurring");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
}
