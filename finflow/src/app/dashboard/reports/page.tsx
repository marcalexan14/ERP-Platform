import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { getBalanceSheet, getCashFlowSummary, getProfitAndLoss } from "@/lib/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const [pnl, balanceSheet, cashFlow] = await Promise.all([
    getProfitAndLoss(org.id),
    getBalanceSheet(org.id),
    getCashFlowSummary(org.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Generated live from your ledger — all activity to date</p>
      </div>

      <Tabs defaultValue="pnl">
        <TabsList>
          <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profit &amp; Loss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="mb-1 font-medium text-muted-foreground">Revenue</div>
                {pnl.revenueLines.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{l.name}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>Total Revenue</span>
                  <span>{currency.format(pnl.totalRevenue)}</span>
                </div>
              </div>
              <div>
                <div className="mb-1 font-medium text-muted-foreground">Expenses</div>
                {pnl.expenseLines.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{l.name}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>Total Expenses</span>
                  <span>{currency.format(pnl.totalExpense)}</span>
                </div>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Net Income</span>
                <span>{currency.format(pnl.netIncome)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Balance Sheet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="mb-1 font-medium text-muted-foreground">Assets</div>
                {balanceSheet.assets.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{l.name}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>Total Assets</span>
                  <span>{currency.format(balanceSheet.totalAssets)}</span>
                </div>
              </div>
              <div>
                <div className="mb-1 font-medium text-muted-foreground">Liabilities</div>
                {balanceSheet.liabilities.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{l.name}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>Total Liabilities</span>
                  <span>{currency.format(balanceSheet.totalLiabilities)}</span>
                </div>
              </div>
              <div>
                <div className="mb-1 font-medium text-muted-foreground">Equity</div>
                {balanceSheet.equity.map((l) => (
                  <div key={l.code} className="flex justify-between py-1">
                    <span>{l.name}</span>
                    <span>{currency.format(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1">
                  <span>Retained Earnings (Net Income)</span>
                  <span>{currency.format(balanceSheet.retainedEarnings)}</span>
                </div>
                <div className="flex justify-between border-t py-1 font-medium">
                  <span>Total Equity</span>
                  <span>{currency.format(balanceSheet.totalEquity)}</span>
                </div>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Liabilities + Equity</span>
                <span>{currency.format(balanceSheet.totalLiabilities + balanceSheet.totalEquity)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cash Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {cashFlow.byCategory.length === 0 && <p className="text-muted-foreground">No cash activity yet.</p>}
              {cashFlow.byCategory.map((c) => (
                <div key={c.category} className="flex justify-between py-1 capitalize">
                  <span>{c.category}</span>
                  <span>{currency.format(c.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Net Change in Cash</span>
                <span>{currency.format(cashFlow.netChange)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
