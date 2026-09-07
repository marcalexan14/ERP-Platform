import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { db } from "@/db";
import { recurringRules, clients } from "@/db/schema";
import { toggleRecurringRuleAction, runRecurringNowAction } from "@/app/actions/recurring";
import { RecurringForm } from "@/components/dashboard/recurring-form";
import { getTranslator, type TranslationKey } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const FREQ_KEYS: Record<string, TranslationKey> = {
  WEEKLY: "freq_weekly",
  MONTHLY: "freq_monthly",
  QUARTERLY: "freq_quarterly",
  YEARLY: "freq_yearly",
};

export default async function RecurringPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const t = getTranslator(org.locale);

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
          <h1 className="text-2xl font-semibold tracking-tight">{t("recurring_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("recurring_subtitle")}</p>
        </div>
        <form action={runRecurringNowAction}>
          <Button type="submit" variant="outline">
            {t("recurring_run_due_now")}
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("recurring_new_rule")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringForm clients={orgClients} locale={org.locale} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("recurring_all_rules")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("recurring_col_type")}</TableHead>
                <TableHead>{t("recurring_col_description")}</TableHead>
                <TableHead>{t("recurring_col_frequency")}</TableHead>
                <TableHead>{t("recurring_col_next_run")}</TableHead>
                <TableHead className="text-right">{t("recurring_col_amount")}</TableHead>
                <TableHead className="text-right">{t("recurring_col_status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    {t("recurring_empty")}
                  </TableCell>
                </TableRow>
              )}
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Badge variant="secondary">
                      {rule.kind === "INVOICE" ? t("status_invoice") : t("status_expense")}
                    </Badge>
                  </TableCell>
                  <TableCell>{rule.description || rule.client?.name || "—"}</TableCell>
                  <TableCell>{t(FREQ_KEYS[rule.frequency])}</TableCell>
                  <TableCell>{dateFormat.format(rule.nextRunDate)}</TableCell>
                  <TableCell className="text-right">{currency.format(Number(rule.amount))}</TableCell>
                  <TableCell className="text-right">
                    <form action={toggleRecurringRuleAction} className="inline">
                      <input type="hidden" name="ruleId" value={rule.id} />
                      <input type="hidden" name="nextActive" value={(!rule.active).toString()} />
                      <Button type="submit" size="sm" variant={rule.active ? "outline" : "default"}>
                        {rule.active ? t("recurring_pause") : t("recurring_resume")}
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
