import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  { title: "Invoicing", body: "Create, send, and track invoices with multi-currency support." },
  { title: "Expenses & income", body: "Log transactions in seconds — every entry posts to a real ledger." },
  { title: "Reports", body: "P&L, balance sheet, and cash flow, generated from your actual data." },
  { title: "Multi-tenant", body: "One platform, branded per client — your own accent color and logo." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <span className="text-lg font-semibold">FinFlow</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button nativeButton={false} render={<Link href="/signup" />}>Get started</Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Financial management, built for small &amp; growing businesses
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Invoicing, expenses, and reporting in one place — with a real double-entry ledger underneath.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
            Create your account
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-8 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title} className="text-left">
              <CardHeader>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.body}</CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
