"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Receipt,
  BarChart3,
  Building2,
  Repeat,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  {
    title: "Invoicing",
    body: "Create, send, and track invoices — every one posts straight to your ledger.",
    icon: FileText,
  },
  {
    title: "Expenses & income",
    body: "Log transactions in seconds, attach receipts, and let the categories build themselves.",
    icon: Receipt,
  },
  {
    title: "Live reports",
    body: "P&L, balance sheet, and cash flow — computed from real double-entry data, not guesses.",
    icon: BarChart3,
  },
  {
    title: "Recurring billing",
    body: "Subscriptions and retainers that invoice themselves, on schedule, without you lifting a finger.",
    icon: Repeat,
  },
  {
    title: "Multi-tenant",
    body: "One platform, branded per client — your own accent color and logo on every dashboard.",
    icon: Building2,
  },
];

const STATS = [
  { value: "100%", label: "Double-entry accurate" },
  { value: "5 min", label: "To send your first invoice" },
  { value: "0", label: "Spreadsheets required" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="bg-mesh pointer-events-none absolute inset-0 -z-10" />

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-md">
        <span className="flex items-center gap-1.5 text-lg font-semibold">
          <Sparkles className="h-4 w-4 text-brand-teal" />
          FinFlow
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button nativeButton={false} render={<Link href="/signup" />}>
            Get started
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-20 px-6 py-20 text-center">
        <motion.div
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-6"
        >
          <motion.span
            custom={0}
            variants={fadeUp}
            className="rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
          >
            Built for small &amp; growing businesses
          </motion.span>
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl"
          >
            Financial management that{" "}
            <span className="text-gradient-brand">actually adds up</span>
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="mx-auto max-w-xl text-lg text-muted-foreground"
          >
            Invoicing, expenses, and reporting in one place — with a real double-entry ledger
            underneath, so the numbers are always right.
          </motion.p>
          <motion.div custom={3} variants={fadeUp} className="flex gap-3 pt-2">
            <Button size="lg" nativeButton={false} render={<Link href="/signup" />} className="group">
              Create your account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
              Sign in
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="grid w-full grid-cols-3 gap-4 rounded-2xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:gap-8 sm:p-8"
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-gradient-brand sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="card-hover h-full border-border/70 text-left">
                <CardHeader>
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                    <f.icon className="h-4.5 w-4.5 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{f.body}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-2xl border border-border bg-gradient-to-br from-brand-teal/10 via-card to-brand-violet/10 p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Ready to see it running?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Set up your organization in under a minute — no credit card, no spreadsheet migration.
          </p>
          <Button size="lg" className="mt-6" nativeButton={false} render={<Link href="/signup" />}>
            Get started free
          </Button>
        </motion.div>
      </main>

      <footer className="border-t border-border/60 px-6 py-8 text-center text-xs text-muted-foreground">
        FinFlow — financial management for small &amp; growing businesses
      </footer>
    </div>
  );
}
