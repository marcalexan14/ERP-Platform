"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Receipt, FileText, BarChart3, Settings, Users, Repeat } from "lucide-react";
import { getTranslator, type TranslationKey } from "@/lib/i18n";

// Defined here (not passed as a prop) because icon components are functions,
// and functions can't cross the server -> client component boundary.
const NAV_ITEMS: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", labelKey: "nav_dashboard", icon: LayoutDashboard },
  { href: "/dashboard/invoices", labelKey: "nav_invoices", icon: FileText },
  { href: "/dashboard/expenses", labelKey: "nav_expenses", icon: Receipt },
  { href: "/dashboard/recurring", labelKey: "nav_recurring", icon: Repeat },
  { href: "/dashboard/reports", labelKey: "nav_reports", icon: BarChart3 },
  { href: "/dashboard/clients", labelKey: "nav_clients", icon: Users },
  { href: "/dashboard/settings", labelKey: "nav_settings", icon: Settings },
];

export function SidebarNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = getTranslator(locale);

  return (
    <nav className="flex-1 space-y-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "" : "hover:bg-accent/60"
            }`}
          >
            {active && (
              <motion.span
                layoutId="sidebar-active-pill"
                className="absolute inset-0 rounded-lg bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <item.icon
              className={`relative z-10 h-4 w-4 ${active ? "text-accent-foreground" : "text-muted-foreground"}`}
            />
            <span className={`relative z-10 ${active ? "text-accent-foreground" : "text-muted-foreground"}`}>
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
