"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { month: string; revenue: number; expense: number };

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function RevenueChart({ data, accentColor }: { data: Point[]; accentColor: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No transactions yet — add an expense or income entry to see trends here.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={accentColor} stopOpacity={0.35} />
            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => currency.format(v)} width={80} />
        <Tooltip formatter={(value) => currency.format(Number(value ?? 0))} />
        <Area type="monotone" dataKey="revenue" stroke={accentColor} fill="url(#revenueFill)" strokeWidth={2} name="Revenue" />
        <Area type="monotone" dataKey="expense" stroke="#94a3b8" fill="transparent" strokeWidth={2} strokeDasharray="4 4" name="Expenses" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
