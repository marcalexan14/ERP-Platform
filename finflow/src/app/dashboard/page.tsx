import { redirect } from "next/navigation";
import { DollarSign, TrendingDown, TrendingUp, FileClock } from "lucide-react";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { getExpenseBreakdown, getKpis, getMonthlySeries, getPeriodComparison, percentChange } from "@/lib/reports";
import { getTranslator } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const t = getTranslator(org.locale);

  const [kpis, series, comparison, breakdown] = await Promise.all([
    getKpis(org.id),
    getMonthlySeries(org.id),
    getPeriodComparison(org.id),
    getExpenseBreakdown(org.id),
  ]);

  const revenuePct = percentChange(comparison.current.revenue, comparison.previous.revenue);
  const expensePct = percentChange(comparison.current.expense, comparison.previous.expense);
  const netCurrent = comparison.current.revenue - comparison.current.expense;
  const netPrevious = comparison.previous.revenue - comparison.previous.expense;
  const netPct = percentChange(netCurrent, netPrevious);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard_subtitle", { org: org.name })}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("kpi_revenue")}
          value={kpis.revenue}
          icon={<DollarSign />}
          trend={{ pct: revenuePct, goodDirection: "up" }}
          noPriorDataLabel={t("kpi_no_prior_data")}
          vsLastMonthLabel={t("kpi_vs_last_month")}
          delay={0}
        />
        <KpiCard
          label={t("kpi_expenses")}
          value={kpis.expense}
          icon={<TrendingDown />}
          trend={{ pct: expensePct, goodDirection: "down" }}
          noPriorDataLabel={t("kpi_no_prior_data")}
          vsLastMonthLabel={t("kpi_vs_last_month")}
          delay={0.05}
        />
        <KpiCard
          label={t("kpi_net_profit")}
          value={kpis.netProfit}
          icon={<TrendingUp />}
          trend={{ pct: netPct, goodDirection: "up" }}
          noPriorDataLabel={t("kpi_no_prior_data")}
          vsLastMonthLabel={t("kpi_vs_last_month")}
          delay={0.1}
        />
        <KpiCard label={t("kpi_outstanding")} value={kpis.outstandingTotal} icon={<FileClock />} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("chart_revenue_vs_expenses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart
              data={series}
              revenueLabel={t("kpi_revenue")}
              expenseLabel={t("kpi_expenses")}
              emptyLabel={t("chart_no_transactions")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("chart_expense_breakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseBreakdownChart data={breakdown} totalLabel={t("chart_total")} emptyLabel={t("chart_no_expenses")} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
