import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { db } from "@/db";
import { expenses, categories, attachments } from "@/db/schema";
import { addExpenseAction } from "@/app/actions/expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function ExpensesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const rows = await db
    .select({
      id: expenses.id,
      kind: expenses.kind,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      categoryName: categories.name,
      receiptUrl: attachments.fileUrl,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .leftJoin(attachments, eq(attachments.expenseId, expenses.id))
    .where(eq(expenses.organizationId, org.id))
    .orderBy(desc(expenses.date))
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Expenses &amp; Income</h1>
        <p className="text-sm text-muted-foreground">Track money in and out — each entry posts to your ledger automatically</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addExpenseAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="kind">Type</Label>
              <Select name="kind" defaultValue="EXPENSE">
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="e.g. Software" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Optional note" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt</Label>
              <Input id="receipt" name="receipt" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" />
            </div>
            <Button type="submit">Add entry</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No entries yet.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{dateFormat.format(row.date)}</TableCell>
                  <TableCell>
                    <Badge variant={row.kind === "INCOME" ? "default" : "secondary"}>{row.kind}</Badge>
                  </TableCell>
                  <TableCell>{row.categoryName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{row.description || "—"}</TableCell>
                  <TableCell>
                    {row.receiptUrl ? (
                      <a
                        href={row.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">{currency.format(Number(row.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
