"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Receipt, FileText, BarChart3, Settings, Users, Repeat } from "lucide-react";

// Defined here (not passed as a prop) because icon components are functions,
// and functions can't cross the server -> client component boundary.
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/recurring", label: "Recurring", icon: Repeat },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

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
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
