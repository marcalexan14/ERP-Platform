"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/app/actions/auth";

const POINTS = [
  { icon: Zap, text: "Send your first invoice in minutes" },
  { icon: ShieldCheck, text: "A real double-entry ledger underneath" },
  { icon: BarChart3, text: "Live P&L, balance sheet, and cash flow" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-mesh relative hidden flex-col justify-between border-r border-border p-10 lg:flex">
        <span className="flex items-center gap-1.5 text-lg font-semibold">
          <Sparkles className="h-4 w-4 text-brand-teal" />
          FinFlow
        </span>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="max-w-sm text-3xl font-semibold tracking-tight text-balance">
            Welcome back to <span className="text-gradient-brand">your books</span>
          </h2>
          <ul className="space-y-3">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm">
                  <p.icon className="h-4 w-4 text-brand-teal" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </motion.div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} FinFlow</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="space-y-1 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">Access your organization&apos;s dashboard</p>
          </div>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
