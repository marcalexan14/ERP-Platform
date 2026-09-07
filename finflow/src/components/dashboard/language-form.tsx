"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateLocaleAction } from "@/app/actions/settings";

const OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية (Arabic)" },
];

export function LanguageForm({ currentLocale, saveLabel }: { currentLocale: string; saveLabel: string }) {
  const [locale, setLocale] = useState(currentLocale);

  return (
    <form action={updateLocaleAction} className="flex items-end gap-3">
      <input type="hidden" name="locale" value={locale} />
      <Select value={locale} onValueChange={(v) => setLocale(v ?? "en")}>
        <SelectTrigger className="w-56">
          <SelectValue>{(v: string) => OPTIONS.find((o) => o.value === v)?.label ?? v}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit">{saveLabel}</Button>
    </form>
  );
}
