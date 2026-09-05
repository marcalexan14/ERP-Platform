import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  numeric,
  boolean,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const id = () => text("id").primaryKey().$defaultFn(() => createId());

// ---------- Enums ----------

export const roleEnum = pgEnum("role", [
  "OWNER",
  "ADMIN",
  "ACCOUNTANT",
  "EMPLOYEE",
  "VIEWER",
]);

export const accountTypeEnum = pgEnum("account_type", [
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "REVENUE",
  "EXPENSE",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "VOID",
]);

export const categoryKindEnum = pgEnum("category_kind", ["EXPENSE", "INCOME"]);
export const expenseKindEnum = pgEnum("expense_kind", ["EXPENSE", "INCOME"]);

export const recurrenceFrequencyEnum = pgEnum("recurrence_frequency", [
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
]);
export const recurringKindEnum = pgEnum("recurring_kind", ["INVOICE", "EXPENSE"]);

// ---------- Auth / Tenancy ----------

export const users = pgTable("users", {
  id: id(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (t) => [uniqueIndex("oauth_provider_account_idx").on(t.provider, t.providerAccountId)],
);

export const sessions = pgTable("sessions", {
  id: id(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const organizations = pgTable("organizations", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  accentColor: text("accent_color").notNull().default("#0f766e"),
  baseCurrency: text("base_currency").notNull().default("USD"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull().default("EMPLOYEE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("membership_user_org_idx").on(t.userId, t.organizationId)],
);

// ---------- Chart of accounts / double-entry ledger ----------

export const accounts = pgTable(
  "accounts",
  {
    id: id(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    type: accountTypeEnum("type").notNull(),
    isSystem: boolean("is_system").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("account_org_code_idx").on(t.organizationId, t.code)],
);

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: id(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull().defaultNow(),
    memo: text("memo"),
    sourceType: text("source_type"), // "invoice" | "expense" | "manual" | "payroll"
    sourceId: text("source_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("journal_entry_org_date_idx").on(t.organizationId, t.date),
    index("journal_entry_source_idx").on(t.sourceType, t.sourceId),
  ],
);

// Sum of debits must equal sum of credits per journal entry (enforced in app code).
export const journalLines = pgTable(
  "journal_lines",
  {
    id: id(),
    journalEntryId: text("journal_entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    debit: numeric("debit", { precision: 14, scale: 2 }).notNull().default("0"),
    credit: numeric("credit", { precision: 14, scale: 2 }).notNull().default("0"),
  },
  (t) => [index("journal_line_account_idx").on(t.accountId)],
);

// ---------- Clients (who orgs invoice) ----------

export const clients = pgTable("clients", {
  id: id(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Invoicing ----------

export const invoices = pgTable(
  "invoices",
  {
    id: id(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id),
    number: text("number").notNull(),
    status: invoiceStatusEnum("status").notNull().default("DRAFT"),
    currency: text("currency").notNull().default("USD"),
    issueDate: timestamp("issue_date").notNull().defaultNow(),
    dueDate: timestamp("due_date").notNull(),
    paidAt: timestamp("paid_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("invoice_org_number_idx").on(t.organizationId, t.number)],
);

export const invoiceLines = pgTable("invoice_lines", {
  id: id(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
});

// ---------- Expenses / income ----------

export const categories = pgTable(
  "categories",
  {
    id: id(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: categoryKindEnum("kind").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("category_org_name_kind_idx").on(t.organizationId, t.name, t.kind)],
);

export const expenses = pgTable("expenses", {
  id: id(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id),
  kind: expenseKindEnum("kind").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Recurring transactions ----------

export const recurringRules = pgTable("recurring_rules", {
  id: id(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  kind: recurringKindEnum("kind").notNull(),
  // Set for kind = INVOICE (who to bill); ignored for EXPENSE.
  clientId: text("client_id").references(() => clients.id),
  // Set for kind = EXPENSE (optional categorization); ignored for INVOICE.
  categoryId: text("category_id").references(() => categories.id),
  frequency: recurrenceFrequencyEnum("frequency").notNull(),
  nextRunDate: timestamp("next_run_date").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Attachments (receipts, invoice PDFs) ----------

export const attachments = pgTable("attachments", {
  id: id(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  expenseId: text("expense_id").references(() => expenses.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Relations ----------

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  sessions: many(sessions),
  oauthAccounts: many(oauthAccounts),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  accounts: many(accounts),
  journalEntries: many(journalEntries),
  clients: many(clients),
  invoices: many(invoices),
  expenses: many(expenses),
  categories: many(categories),
  recurringRules: many(recurringRules),
  attachments: many(attachments),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [accounts.organizationId],
    references: [organizations.id],
  }),
  journalLines: many(journalLines),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [journalEntries.organizationId],
    references: [organizations.id],
  }),
  lines: many(journalLines),
}));

export const journalLinesRelations = relations(journalLines, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalLines.journalEntryId],
    references: [journalEntries.id],
  }),
  account: one(accounts, { fields: [journalLines.accountId], references: [accounts.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [invoices.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  lines: many(invoiceLines),
  attachments: many(attachments),
}));

export const invoiceLinesRelations = relations(invoiceLines, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLines.invoiceId], references: [invoices.id] }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [categories.organizationId],
    references: [organizations.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [expenses.organizationId],
    references: [organizations.id],
  }),
  category: one(categories, { fields: [expenses.categoryId], references: [categories.id] }),
  attachments: many(attachments),
}));

export const recurringRulesRelations = relations(recurringRules, ({ one }) => ({
  organization: one(organizations, {
    fields: [recurringRules.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, { fields: [recurringRules.clientId], references: [clients.id] }),
  category: one(categories, { fields: [recurringRules.categoryId], references: [categories.id] }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  organization: one(organizations, {
    fields: [attachments.organizationId],
    references: [organizations.id],
  }),
  invoice: one(invoices, { fields: [attachments.invoiceId], references: [invoices.id] }),
  expense: one(expenses, { fields: [attachments.expenseId], references: [expenses.id] }),
}));
