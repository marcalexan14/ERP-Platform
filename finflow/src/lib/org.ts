import { db } from "@/db";
import { memberships } from "@/db/schema";
import { eq } from "drizzle-orm";

// MVP simplification: each user works within their first organization.
// Add an org switcher once users can belong to more than one.
export async function getCurrentOrganization(userId: string) {
  const membership = await db.query.memberships.findFirst({
    where: eq(memberships.userId, userId),
    with: { organization: true },
  });
  return membership?.organization ?? null;
}

export async function requireOrgId(userId: string) {
  const org = await getCurrentOrganization(userId);
  if (!org) throw new Error("No organization found for this user");
  return org.id;
}
