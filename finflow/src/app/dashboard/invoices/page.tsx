import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { db } from "@/db";
import { invoices, clients } from "@/db/schema";
import { computeInvoiceTotal } from "@/lib/invoices";
import { markInvoicePaidAction } from "@/app/actions/invoices";
import { InvoiceForm } from "@/components/dashboard/invoice-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

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
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">Bill your clients and track what&apos;s outstanding</p>
      </div>

      {orgClients.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Add a client first before creating an invoice — see the{" "}
            <Link href="/dashboard/clients" className="underline underline-offset-4">
              Clients
            </Link>{" "}
            page.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm clients={orgClients} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No invoices yet.
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
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{dateFormat.format(inv.dueDate)}</TableCell>
                  <TableCell className="text-right">{currency.format(computeInvoiceTotal(inv.lines))}</TableCell>
                  <TableCell className="text-right">
                    {inv.status !== "PAID" && inv.status !== "VOID" && (
                      <form action={markInvoicePaidAction}>
                        <input type="hidden" name="invoiceId" value={inv.id} />
                        <Button type="submit" size="sm" variant="outline">
                          Mark paid
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
