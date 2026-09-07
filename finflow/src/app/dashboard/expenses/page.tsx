import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { db } from "@/db";
import { expenses, categories, attachments } from "@/db/schema";
import { ExpenseForm } from "@/components/dashboard/expense-form";
import { getTranslator } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function ExpensesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const t = getTranslator(org.locale);

  const rows = await db
    .select({
      id: expenses.id,
      kind: expenses.kind,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      categoryName: categories.name,
      receiptUrl: attachments.fileUrl,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .leftJoin(attachments, eq(attachments.expenseId, expenses.id))
    .where(eq(expenses.organizationId, org.id))
    .orderBy(desc(expenses.date))
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("expenses_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("expenses_subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("expenses_add_entry")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm locale={org.locale} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("expenses_recent_activity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("expenses_col_date")}</TableHead>
                <TableHead>{t("expenses_col_type")}</TableHead>
                <TableHead>{t("expenses_col_category")}</TableHead>
                <TableHead>{t("expenses_col_description")}</TableHead>
                <TableHead>{t("expenses_col_receipt")}</TableHead>
                <TableHead className="text-right">{t("expenses_col_amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    {t("expenses_empty")}
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{dateFormat.format(row.date)}</TableCell>
                  <TableCell>
                    <Badge variant={row.kind === "INCOME" ? "default" : "secondary"}>
                      {row.kind === "INCOME" ? t("status_income") : t("status_expense")}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.categoryName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{row.description || "—"}</TableCell>
                  <TableCell>
                    {row.receiptUrl ? (
                      <a
                        href={row.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4"
                      >
                        {t("view")}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">{currency.format(Number(row.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
