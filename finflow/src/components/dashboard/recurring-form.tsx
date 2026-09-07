"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRecurringRuleAction } from "@/app/actions/recurring";
import { getTranslator, type TranslationKey } from "@/lib/i18n";

const FREQUENCIES = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
const FREQ_KEYS: Record<string, TranslationKey> = {
  WEEKLY: "freq_weekly",
  MONTHLY: "freq_monthly",
  QUARTERLY: "freq_quarterly",
  YEARLY: "freq_yearly",
};

export function RecurringForm({ clients, locale }: { clients: { id: string; name: string }[]; locale: string }) {
  const t = getTranslator(locale);
  const [kind, setKind] = useState<"EXPENSE" | "INVOICE">("EXPENSE");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("MONTHLY");
  const [clientId, setClientId] = useState("");

  const kindLabel = (v: string) => (v === "INVOICE" ? t("status_invoice") : t("status_expense"));

  return (
    <form action={createRecurringRuleAction} className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:items-end">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="frequency" value={frequency} />
      {kind === "INVOICE" && <input type="hidden" name="clientId" value={clientId} />}

      <div className="space-y-2">
        <Label htmlFor="kind">{t("type")}</Label>
        <Select value={kind} onValueChange={(v) => setKind((v as "EXPENSE" | "INVOICE") ?? "EXPENSE")}>
          <SelectTrigger id="kind">
            <SelectValue>{(v: string) => kindLabel(v)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">{t("status_expense")}</SelectItem>
            <SelectItem value="INVOICE">{t("status_invoice")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {kind === "INVOICE" && (
        <div className="space-y-2">
          <Label htmlFor="clientId">{t("client")}</Label>
          <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
            <SelectTrigger id="clientId">
              <SelectValue placeholder={t("select_client")}>
                {(value: string | null) => clients.find((c) => c.id === value)?.name ?? t("select_client")}
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
        <Label htmlFor="frequency">{t("recurring_frequency")}</Label>
        <Select value={frequency} onValueChange={(v) => setFrequency((v as (typeof FREQUENCIES)[number]) ?? "MONTHLY")}>
          <SelectTrigger id="frequency">
            <SelectValue>{(v: string) => t(FREQ_KEYS[v])}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map((f) => (
              <SelectItem key={f} value={f}>
                {t(FREQ_KEYS[f])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t("amount_usd")}</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">{t("recurring_starts")}</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Input id="description" name="description" placeholder={t("recurring_description_placeholder")} />
      </div>

      <Button type="submit">{t("recurring_add_rule")}</Button>
    </form>
  );
}
