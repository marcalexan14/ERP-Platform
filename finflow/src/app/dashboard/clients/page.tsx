import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { addClientAction } from "@/app/actions/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  if (!org) redirect("/login");

  const rows = await db.query.clients.findMany({
    where: eq(clients.organizationId, org.id),
    orderBy: asc(clients.name),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">Who you bill</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add client</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addClientAction} className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" />
            </div>
            <Button type="submit">Add client</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    No clients yet.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.address || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
