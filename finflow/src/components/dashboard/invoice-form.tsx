"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoiceAction } from "@/app/actions/invoices";

type LineRow = { id: string; description: string; quantity: string; unitPrice: string };

function newRow(): LineRow {
  return { id: crypto.randomUUID(), description: "", quantity: "1", unitPrice: "" };
}

export function InvoiceForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [rows, setRows] = useState<LineRow[]>([newRow()]);
  const [clientId, setClientId] = useState("");

  function updateRow(id: string, field: keyof LineRow, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  return (
    <form action={createInvoiceAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <input type="hidden" name="clientId" value={clientId} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" name="dueDate" type="date" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Line items</Label>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_5rem_6rem_auto] items-center gap-2">
              <Input
                name="description"
                placeholder="Description"
                value={row.description}
                onChange={(e) => updateRow(row.id, "description", e.target.value)}
              />
              <Input
                name="quantity"
                type="number"
                step="0.01"
                min="0"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
              />
              <Input
                name="unitPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={row.unitPrice}
                onChange={(e) => updateRow(row.id, "unitPrice", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={rows.length === 1}
                onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, newRow()])}>
          <Plus className="h-4 w-4" />
          Add line
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Optional" />
      </div>

      <Button type="submit">Create &amp; send invoice</Button>
    </form>
  );
}
