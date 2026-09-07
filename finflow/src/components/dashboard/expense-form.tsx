"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addExpenseAction } from "@/app/actions/expenses";
import { getTranslator } from "@/lib/i18n";

export function ExpenseForm({ locale }: { locale: string }) {
  const t = getTranslator(locale);
  const [kind, setKind] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const kindLabel = (v: string) => (v === "INCOME" ? t("status_income") : t("status_expense"));

  return (
    <form action={addExpenseAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
      <input type="hidden" name="kind" value={kind} />
      <div className="space-y-2">
        <Label htmlFor="kind">{t("type")}</Label>
        <Select value={kind} onValueChange={(v) => setKind((v as "EXPENSE" | "INCOME") ?? "EXPENSE")}>
          <SelectTrigger id="kind">
            <SelectValue>{(v: string) => kindLabel(v)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">{t("status_expense")}</SelectItem>
            <SelectItem value="INCOME">{t("status_income")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">{t("amount_usd")}</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">{t("expenses_category")}</Label>
        <Input id="category" name="category" placeholder={t("expenses_category_placeholder")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Input id="description" name="description" placeholder={t("expenses_description_placeholder")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="receipt">{t("expenses_receipt")}</Label>
        <Input id="receipt" name="receipt" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" />
      </div>
      <Button type="submit">{t("expenses_add_entry")}</Button>
    </form>
  );
}
