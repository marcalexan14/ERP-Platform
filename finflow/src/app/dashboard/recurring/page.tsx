import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { db } from "@/db";
import { recurringRules, clients } from "@/db/schema";
import { toggleRecurringRuleAction, runRecurringNowAction } from "@/app/actions/recurring";
import { RecurringForm } from "@/components/dashboard/recurring-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function RecurringPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const orgClients = await db.query.clients.findMany({
    where: eq(clients.organizationId, org.id),
    orderBy: asc(clients.name),
  });

  const rules = await db.query.recurringRules.findMany({
    where: eq(recurringRules.organizationId, org.id),
    orderBy: desc(recurringRules.createdAt),
    with: { client: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recurring</h1>
          <p className="text-sm text-muted-foreground">Bills and subscriptions that repeat automatically</p>
        </div>
        <form action={runRecurringNowAction}>
          <Button type="submit" variant="outline">
            Run due now
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New recurring rule</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringForm clients={orgClients} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next run</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No recurring rules yet.
                  </TableCell>
                </TableRow>
              )}
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Badge variant="secondary">{rule.kind}</Badge>
                  </TableCell>
                  <TableCell>{rule.description || rule.client?.name || "—"}</TableCell>
                  <TableCell className="capitalize">{rule.frequency.toLowerCase()}</TableCell>
                  <TableCell>{dateFormat.format(rule.nextRunDate)}</TableCell>
                  <TableCell className="text-right">{currency.format(Number(rule.amount))}</TableCell>
                  <TableCell className="text-right">
                    <form action={toggleRecurringRuleAction} className="inline">
                      <input type="hidden" name="ruleId" value={rule.id} />
                      <input type="hidden" name="nextActive" value={(!rule.active).toString()} />
                      <Button type="submit" size="sm" variant={rule.active ? "outline" : "default"}>
                        {rule.active ? "Pause" : "Resume"}
                      </Button>
                    </form>
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
