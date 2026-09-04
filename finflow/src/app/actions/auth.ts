"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, organizations, memberships } from "@/db/schema";
import { signIn } from "@/auth";
import { seedChartOfAccounts } from "@/lib/ledger";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function signUpAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const companyName = String(formData.get("companyName") ?? "").trim();

  if (!name || !email || !password || !companyName) {
    throw new Error("All fields are required");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    throw new Error("An account with that email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning();

  const slug = `${slugify(companyName)}-${user.id.slice(0, 6)}`;
  const [org] = await db.insert(organizations).values({ name: companyName, slug }).returning();

  await db.insert(memberships).values({ userId: user.id, organizationId: org.id, role: "OWNER" });
  await seedChartOfAccounts(org.id);

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}
