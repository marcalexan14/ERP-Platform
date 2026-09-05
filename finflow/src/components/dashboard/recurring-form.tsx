"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRecurringRuleAction } from "@/app/actions/recurring";

const FREQUENCIES = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;

export function RecurringForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [kind, setKind] = useState<"EXPENSE" | "INVOICE">("EXPENSE");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("MONTHLY");
  const [clientId, setClientId] = useState("");

  return (
    <form action={createRecurringRuleAction} className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:items-end">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="frequency" value={frequency} />
      {kind === "INVOICE" && <input type="hidden" name="clientId" value={clientId} />}

      <div className="space-y-2">
        <Label htmlFor="kind">Type</Label>
        <Select value={kind} onValueChange={(v) => setKind(v as "EXPENSE" | "INVOICE")}>
          <SelectTrigger id="kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INVOICE">Invoice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {kind === "INVOICE" && (
        <div className="space-y-2">
          <Label htmlFor="clientId">Client</Label>
          <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
            <SelectTrigger id="clientId">
              <SelectValue placeholder="Select a client">
                {(value: string | null) => clients.find((c) => c.id === value)?.name ?? "Select a client"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select value={frequency} onValueChange={(v) => setFrequency(v as (typeof FREQUENCIES)[number])}>
          <SelectTrigger id="frequency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map((f) => (
              <SelectItem key={f} value={f}>
                {f[0] + f.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Starts</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="e.g. Hosting subscription" />
      </div>

      <Button type="submit">Add recurring rule</Button>
    </form>
  );
}
