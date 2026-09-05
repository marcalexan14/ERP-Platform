"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/dashboard/animated-number";

type Trend = { pct: number | null; goodDirection: "up" | "down" };

export function KpiCard({
  label,
  value,
  icon,
  trend,
  delay = 0,
}: {
  label: string;
  value: number;
  // A rendered element (e.g. <DollarSign className="h-4 w-4" />), not a component
  // reference — component functions can't cross the server -> client boundary.
  icon: React.ReactNode;
  trend?: Trend;
  delay?: number;
}) {
  const isUp = trend && trend.pct !== null && trend.pct > 0;
  const isDown = trend && trend.pct !== null && trend.pct < 0;
  const isGood = trend && ((trend.goodDirection === "up" && isUp) || (trend.goodDirection === "down" && isDown));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="card-hover overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground [&_svg]:h-4 [&_svg]:w-4">
            {icon}
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums">
            <AnimatedNumber value={value} />
          </div>
          {trend && (
            <div className="mt-1.5 flex items-center gap-1 text-xs">
              {trend.pct === null ? (
                <span className="text-muted-foreground">No prior data</span>
              ) : (
                <>
                  <span
                    className={`flex items-center gap-0.5 font-medium ${
                      isGood ? "text-[oklch(0.5_0.16_150)] dark:text-[oklch(0.72_0.19_150)]" : trend.pct === 0 ? "text-muted-foreground" : "text-destructive"
                    }`}
                  >
                    {isUp && <ArrowUpRight className="h-3.5 w-3.5" />}
                    {isDown && <ArrowDownRight className="h-3.5 w-3.5" />}
                    {Math.abs(trend.pct).toFixed(0)}%
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
