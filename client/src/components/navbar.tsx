import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";

export function Navbar({ variant = "marketing" }: { variant?: "marketing" | "app" }) {
  const { user, isHydrated, theme, toggleTheme } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const loggedIn = isHydrated && !!user;

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-elegant group-hover:scale-105 transition-transform">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">PulsePoll</span>
        </Link>

        {variant === "marketing" && (
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {/* <a href="/#features" className="hover:text-foreground transition">
              Features
            </a> */}
            {loggedIn ? (
              <>
                <Link to="/dashboard" className="hover:text-foreground transition">
                  Dashboard
                </Link>
                <Link to="/dashboard/create" className="hover:text-foreground transition">
                  Create poll
                </Link>
              </>
            ) : (
              <Link to="/signup" search={{ redirect: "" }} className="hover:text-foreground transition">
                Create poll
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {isHydrated && (
            <>
              {loggedIn ? (
                <UserMenu />
              ) : (
                <>
                  {!path.startsWith("/login") && (
                    <Button variant="ghost" asChild className="rounded-xl">
                      <Link to="/login" search={{ redirect: "" }}>Sign in</Link>
                    </Button>
                  )}
                  {!path.startsWith("/signup") && (
                    <Button asChild className="gradient-primary shadow-elegant border-0 rounded-xl">
                      <Link to="/signup" search={{ redirect: "" }}>Get started</Link>
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
