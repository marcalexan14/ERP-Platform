"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Validated categorical palette (see dataviz skill references/palette.md) —
// first four slots pass all-pairs CVD/contrast checks in both modes.
const PALETTE_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
const PALETTE_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500"];
const OTHER_COLOR = "#898781";

type Slice = { name: string; value: number };

function bucketize(data: Slice[], max = 4): Slice[] {
  if (data.length <= max) return data;
  const top = data.slice(0, max - 1);
  const rest = data.slice(max - 1);
  const otherTotal = rest.reduce((sum, d) => sum + d.value, 0);
  return [...top, { name: "Other", value: otherTotal }];
}

export function ExpenseBreakdownChart({ data }: { data: Slice[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No expenses yet — categorized spending will show up here.
      </div>
    );
  }

  const palette = mounted && resolvedTheme === "dark" ? PALETTE_DARK : PALETTE_LIGHT;
  const buckets = bucketize(data);
  const total = buckets.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={buckets}
            dataKey="value"
            nameKey="name"
            innerRadius={64}
            outerRadius={92}
            isAnimationActive={false}
          >
            {buckets.map((entry, i) => (
              <Cell key={entry.name} fill={entry.name === "Other" ? OTHER_COLOR : palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [currency.format(Number(value ?? 0)), name]}
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-9">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-lg font-semibold tabular-nums">{currency.format(total)}</span>
      </div>
    </div>
  );
}
