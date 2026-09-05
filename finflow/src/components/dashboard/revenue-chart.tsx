"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { month: string; revenue: number; expense: number };

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// Validated categorical slots 1 (blue = revenue) and 2 (orange = expense).
const COLORS = {
  light: { revenue: "#2a78d6", expense: "#eb6834", grid: "#e1e0d9", muted: "#898781" },
  dark: { revenue: "#3987e5", expense: "#d95926", grid: "#2c2c2a", muted: "#898781" },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 text-xs shadow-md">
      <div className="mb-1.5 font-medium text-popover-foreground">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-medium tabular-nums text-popover-foreground">{currency.format(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ data }: { data: Point[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No transactions yet — add an expense or income entry to see trends here.
      </div>
    );
  }

  const c = mounted && resolvedTheme === "dark" ? COLORS.dark : COLORS.light;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={c.revenue} stopOpacity={0.32} />
            <stop offset="95%" stopColor={c.revenue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={c.expense} stopOpacity={0.22} />
            <stop offset="95%" stopColor={c.expense} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={c.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke={c.muted} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke={c.muted}
          tickFormatter={(v) => currency.format(v)}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={c.revenue}
          fill="url(#revenueFill)"
          strokeWidth={2}
          name="Revenue"
          activeDot={{ r: 4 }}
          animationDuration={700}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke={c.expense}
          fill="url(#expenseFill)"
          strokeWidth={2}
          name="Expenses"
          activeDot={{ r: 4 }}
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
