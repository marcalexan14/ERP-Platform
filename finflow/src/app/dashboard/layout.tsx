import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { auth, signOut } from "@/auth";
import { getCurrentOrganization } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await getCurrentOrganization(session.user.id);
  const accentColor = org?.accentColor ?? "#0f766e";
  const initials = (session.user.name ?? session.user.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar sm:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${accentColor}, color-mix(in oklch, ${accentColor}, black 15%))` }}
          >
            {org?.name?.[0]?.toUpperCase() ?? "F"}
          </span>
          <span className="flex items-center gap-1 font-semibold">
            {org?.name ?? (
              <>
                <Sparkles className="h-4 w-4 text-brand-teal" /> FinFlow
              </>
            )}
          </span>
        </div>
        <SidebarNav />
        <div className="border-t border-border p-3 text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{session.user.email}</span>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/70 px-6 backdrop-blur-md">
          <div className="text-sm font-medium text-muted-foreground">{org?.name}</div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Avatar className="h-8 w-8 ring-2 ring-accent">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
