"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { auth } from "@/auth";
import { requireOrgId } from "@/lib/org";

export async function addClientAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const organizationId = await requireOrgId(session.user.id);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name) throw new Error("Client name is required");

  await db.insert(clients).values({
    organizationId,
    name,
    email: email || undefined,
    address: address || undefined,
  });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/invoices");
}
