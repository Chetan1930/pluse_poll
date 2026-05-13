import { createFileRoute, Outlet, Link, useRouterState, useNavigate, useSearch } from "@tanstack/react-router";
import {
  BarChart3,
  LayoutDashboard,
  Loader2,
  PlusCircle,
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  X,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/user-menu";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const pageNames: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/create": "Create poll",
};

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
      <Link to="/" className="flex items-center gap-2 px-2 py-2 group">
        <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shadow-elegant group-hover:scale-105 transition-transform">
          <BarChart3 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold">PulsePoll</span>
      </Link>
      <nav className="mt-8 space-y-1 flex-1">
        <p className="px-3 pb-1 text-[11px] uppercase tracking-widest text-sidebar-foreground/40 font-medium">
          Menu
        </p>
        {nav.map((n) => {
          const active = n.exact ? path === n.to : path.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <n.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-primary" : "text-sidebar-foreground/50",
                )}
              />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl gradient-primary p-4 text-primary-foreground shadow-elegant relative overflow-hidden group">
        <div className="absolute inset-0 gradient-mesh opacity-30 group-hover:opacity-50 transition-opacity" />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-widest opacity-70 font-medium">Pro plan</p>
          <p className="mt-1.5 text-sm font-semibold leading-snug">Unlock advanced analytics</p>
          <Button
            size="sm"
            className="mt-3 bg-background/95 text-foreground hover:bg-background w-full rounded-xl backdrop-blur-sm text-xs h-8"
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
  const isOverview = path === "/dashboard" || path === "/dashboard/";
  const routeSearch = useSearch({ strict: false }) as { q?: string };
  const headerQ = isOverview ? (routeSearch.q ?? "") : "";
  const searchRef = useRef<HTMLInputElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [themeRotating, setThemeRotating] = useState(false);

  const handleHeaderSearch = (value: string) => {
    navigate({ to: "/dashboard", search: (prev) => ({ ...prev, q: value }), replace: true });
  };

  // Derive breadcrumb from path
  const segments = path.split("/").filter(Boolean);
  const currentPage = pageNames[path] || segments[segments.length - 1]?.replace(/-/g, " ") || "";

  // Close mobile search on navigation
  useEffect(() => {
    setMobileSearchOpen(false);
  }, [path]);

  // ⌘K / Ctrl+K to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Redirect unauthenticated
  useEffect(() => {
    if (isHydrated && !user) {
      navigate({ to: "/login", search: { redirect: path } });
    }
  }, [user, isHydrated, navigate, path]);

  const handleThemeToggle = () => {
    setThemeRotating(true);
    toggleTheme();
    setTimeout(() => setThemeRotating(false), 500);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/60 bg-sidebar p-4">
        <SidebarContent path={path} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/60 shadow-[0_1px_6px_oklch(0_0_0/0.03)]">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-3 px-3 sm:px-6">
            {/* Left section: hamburger + search + breadcrumb */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Mobile hamburger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0 rounded-xl">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4 bg-sidebar">
                  <SidebarContent path={path} />
                </SheetContent>
              </Sheet>

              {/* Desktop search */}
              <div className="relative hidden sm:block w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  ref={searchRef}
                  placeholder="Search polls..."
                  value={headerQ}
                  onChange={(e) => handleHeaderSearch(e.target.value)}
                  className="h-9 pl-9 pr-16 text-sm rounded-xl bg-background/60 border-border/70 focus-visible:ring-primary/30"
                />
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/70 pointer-events-none">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </div>

              {/* Mobile search: icon toggle */}
              <div className="sm:hidden flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                >
                  {mobileSearchOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Breadcrumb */}
              {currentPage && (
                <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground/60 min-w-0">
                  <span className="text-muted-foreground/40">Dashboard</span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />
                  <span className="font-medium text-foreground/80 truncate">
                    {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Right section: actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleThemeToggle}
                  className="rounded-xl relative"
                  aria-label="Toggle theme"
                >
                  <motion.div
                    animate={{ rotate: themeRotating ? 360 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {theme === "light" ? (
                      <Moon className="h-[15px] w-[15px]" />
                    ) : (
                      <Sun className="h-[15px] w-[15px]" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>

              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl"
                aria-label="Notifications"
              >
                <Bell className="h-[15px] w-[15px]" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive">
                  <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-40" />
                </span>
              </Button>

              <UserMenu />
            </div>
          </div>

          {/* Mobile search overlay */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="sm:hidden overflow-hidden border-t border-border/40"
              >
                <div className="relative px-3 py-2">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search polls..."
                    value={headerQ}
                    onChange={(e) => handleHeaderSearch(e.target.value)}
                    className="h-9 pl-9 text-sm rounded-xl bg-background/80"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
