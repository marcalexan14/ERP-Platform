import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { getBalanceSheet, getCashFlowSummary, getProfitAndLoss } from "@/lib/reports";
import { getTranslator, translateAccountName } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const t = getTranslator(org.locale);
  const name = (code: string, fallback: string) => translateAccountName(org.locale, code, fallback);

  const [pnl, balanceSheet, cashFlow] = await Promise.all([
    getProfitAndLoss(org.id),
    getBalanceSheet(org.id),
    getCashFlowSummary(org.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("reports_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("reports_subtitle")}</p>
      </div>

      <Tabs defaultValue="pnl">
        <TabsList>
          <TabsTrigger value="pnl">{t("reports_tab_pnl")}</TabsTrigger>
          <TabsTrigger value="balance">{t("reports_tab_balance")}</TabsTrigger>
          <TabsTrigger value="cashflow">{t("reports_tab_cashflow")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("reports_tab_pnl")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="mb-1 font-medium text-muted-foreground">{t("reports_revenue")}</div>
                {pnl.revenueLines.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{name(l.code, l.name)}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>{t("reports_total_revenue")}</span>
                  <span>{currency.format(pnl.totalRevenue)}</span>
                </div>
              </div>
              <div>
                <div className="mb-1 font-medium text-muted-foreground">{t("reports_expenses")}</div>
                {pnl.expenseLines.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{name(l.code, l.name)}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>{t("reports_total_expenses")}</span>
                  <span>{currency.format(pnl.totalExpense)}</span>
                </div>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>{t("reports_net_income")}</span>
                <span>{currency.format(pnl.netIncome)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("reports_tab_balance")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="mb-1 font-medium text-muted-foreground">{t("reports_assets")}</div>
                {balanceSheet.assets.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{name(l.code, l.name)}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>{t("reports_total_assets")}</span>
                  <span>{currency.format(balanceSheet.totalAssets)}</span>
                </div>
              </div>
              <div>
                <div className="mb-1 font-medium text-muted-foreground">{t("reports_liabilities")}</div>
                {balanceSheet.liabilities.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{name(l.code, l.name)}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>{t("reports_total_liabilities")}</span>
                  <span>{currency.format(balanceSheet.totalLiabilities)}</span>
                </div>
              </div>
              <div>
                <div className="mb-1 font-medium text-muted-foreground">{t("reports_equity")}</div>
                {balanceSheet.equity.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{name(l.code, l.name)}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1">
                  <span>{t("reports_retained_earnings")}</span>
                  <span>{currency.format(balanceSheet.retainedEarnings)}</span>
                </div>
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>{t("reports_total_equity")}</span>
                  <span>{currency.format(balanceSheet.totalEquity)}</span>
                </div>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>{t("reports_liabilities_plus_equity")}</span>
                <span>{currency.format(balanceSheet.totalLiabilities + balanceSheet.totalEquity)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("reports_tab_cashflow")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {cashFlow.byCategory.length === 0 && (
                <p className="text-muted-foreground">{t("reports_no_cash_activity")}</p>
              )}
              {cashFlow.byCategory.map((c) => (
                <div key={c.category} className="flex justify-between py-1 capitalize">
                  <span>{c.category}</span>
                  <span>{currency.format(c.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>{t("reports_net_change_cash")}</span>
                <span>{currency.format(cashFlow.netChange)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
