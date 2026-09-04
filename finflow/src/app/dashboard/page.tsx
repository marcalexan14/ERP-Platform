import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { getKpis, getMonthlySeries } from "@/lib/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const [kpis, series] = await Promise.all([getKpis(org.id), getMonthlySeries(org.id)]);

  const kpiCards = [
    { label: "Revenue", value: kpis.revenue },
    { label: "Expenses", value: kpis.expense },
    { label: "Net Profit", value: kpis.netProfit },
    { label: "Outstanding Invoices", value: kpis.outstandingTotal },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of {org.name}&apos;s finances</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{currency.format(card.value)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue vs. Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={series} accentColor={org.accentColor} />
        </CardContent>
      </Card>
    </div>
  );
}
