"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { auth } from "@/auth";
import { requireOrgId } from "@/lib/org";
import { LOCALES } from "@/lib/i18n";

export async function updateLocaleAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const organizationId = await requireOrgId(session.user.id);
  const locale = String(formData.get("locale") ?? "en");

  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) {
    throw new Error("Unsupported language");
  }

  await db.update(organizations).set({ locale }).where(eq(organizations.id, organizationId));

  revalidatePath("/dashboard", "layout");
}
