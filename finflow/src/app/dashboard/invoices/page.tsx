import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { db } from "@/db";
import { invoices, clients } from "@/db/schema";
import { computeInvoiceTotal } from "@/lib/invoices";
import { markInvoicePaidAction, unmarkInvoicePaidAction } from "@/app/actions/invoices";
import { InvoiceForm } from "@/components/dashboard/invoice-form";
import { getTranslator, type TranslationKey } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const STATUS_KEYS: Record<string, TranslationKey> = {
  DRAFT: "status_draft",
  SENT: "status_sent",
  PAID: "status_paid",
  OVERDUE: "status_overdue",
  VOID: "status_void",
};

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const t = getTranslator(org.locale);

  const orgClients = await db.query.clients.findMany({
    where: eq(clients.organizationId, org.id),
    orderBy: asc(clients.name),
  });

  const orgInvoices = await db.query.invoices.findMany({
    where: eq(invoices.organizationId, org.id),
    orderBy: desc(invoices.issueDate),
    with: { client: true, lines: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("invoices_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("invoices_subtitle")}</p>
      </div>

      {orgClients.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {t("invoices_add_client_first")}{" "}
            <Link href="/dashboard/clients" className="underline underline-offset-4">
              {t("invoices_clients_link")}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("invoices_new")}</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm clients={orgClients} locale={org.locale} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("invoices_all")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("invoices_col_number")}</TableHead>
                <TableHead>{t("invoices_col_client")}</TableHead>
                <TableHead>{t("invoices_col_status")}</TableHead>
                <TableHead>{t("invoices_col_due")}</TableHead>
                <TableHead className="text-right">{t("invoices_col_total")}</TableHead>
                <TableHead className="text-right">{t("invoices_col_action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    {t("invoices_empty")}
                  </TableCell>
                </TableRow>
              )}
              {orgInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.number}</TableCell>
                  <TableCell>{inv.client.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === "PAID" ? "default" : inv.status === "OVERDUE" ? "destructive" : "secondary"
                      }
                    >
                      {t(STATUS_KEYS[inv.status])}
                    </Badge>
                  </TableCell>
                  <TableCell>{dateFormat.format(inv.dueDate)}</TableCell>
                  <TableCell className="text-right">{currency.format(computeInvoiceTotal(inv.lines))}</TableCell>
                  <TableCell className="text-right">
                    {inv.status !== "PAID" && inv.status !== "VOID" && (
                      <form action={markInvoicePaidAction}>
                        <input type="hidden" name="invoiceId" value={inv.id} />
                        <Button type="submit" size="sm" variant="outline">
                          {t("invoices_mark_paid")}
                        </Button>
                      </form>
                    )}
                    {inv.status === "PAID" && (
                      <form action={unmarkInvoicePaidAction}>
                        <input type="hidden" name="invoiceId" value={inv.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          {t("invoices_undo_paid")}
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
