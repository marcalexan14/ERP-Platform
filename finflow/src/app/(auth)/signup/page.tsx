"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Receipt, FileText, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/app/actions/auth";

const POINTS = [
  { icon: FileText, text: "Invoicing wired to a real ledger" },
  { icon: Receipt, text: "Expense tracking with receipt uploads" },
  { icon: Repeat, text: "Recurring billing that runs itself" },
];

export default function SignUpPage() {
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
            Set up your organization in <span className="text-gradient-brand">under a minute</span>
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
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">No credit card, no spreadsheet migration</p>
          </div>
          <form action={signUpAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" name="companyName" required autoComplete="organization" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
