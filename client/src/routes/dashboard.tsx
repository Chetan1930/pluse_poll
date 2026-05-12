import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  LayoutDashboard,
  PlusCircle,
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/dashboard")({
  component: DashLayout,
});

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/create", label: "Create poll", icon: PlusCircle },
];

function SidebarContent({ path }: { path: string }) {
  return (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 px-2 py-2">
        <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
          <BarChart3 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold">PulsePoll</span>
      </Link>
      <nav className="mt-6 space-y-1 flex-1">
        {nav.map((n) => {
          const active = n.exact ? path === n.to : path.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl gradient-primary p-4 text-primary-foreground shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative">
          <p className="text-xs uppercase tracking-wider opacity-80">Pro plan</p>
          <p className="mt-1 font-semibold">Unlock advanced analytics</p>
          <Button
            size="sm"
            className="mt-3 bg-background text-foreground hover:bg-background/90 w-full rounded-xl"
          >
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}

function DashLayout() {
  const { user, isHydrated, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (isHydrated && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isHydrated, navigate]);

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 flex-col border-r border-border/60 bg-sidebar p-4">
        <SidebarContent path={path} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-border/60">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4 bg-sidebar">
                  <SidebarContent path={path} />
                </SheetContent>
              </Sheet>
              <div className="relative w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search polls..."
                  className="w-full h-9 rounded-xl border border-border bg-background/60 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="relative rounded-xl">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-destructive" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
