import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRequest } from "@/lib/api";

type User = { _id?: string; id?: string; name: string; email: string } | null;

type AuthCtx = {
  user: User;
  isHydrated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const AuthStoreCtx = createContext<AuthCtx | null>(null);
const AUTH_USER_KEY = "pp_user";
const LEGACY_TOKEN_KEY = "pp_token";
const AUTH_CHANGED_EVENT = "pulsepoll:auth-changed";

const readStoredUser = (): User => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncStoredUser = () => setUserState(readStoredUser());
    syncStoredUser();

    const t = (localStorage.getItem("pp_theme") as "light" | "dark") || "light";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");

    apiRequest<{ user: NonNullable<User> }>("/auth/me")
      .then(({ user }) => {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        setUserState(user);
      })
      .catch(() => {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        setUserState(null);
      })
      .finally(() => setIsHydrated(true));

    const handleAuthChange = (event: Event) => {
      const detail = (event as CustomEvent<User>).detail;
      if (detail !== undefined) {
        setUserState(detail);
        return;
      }

      syncStoredUser();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    window.addEventListener("storage", syncStoredUser);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
      window.removeEventListener("storage", syncStoredUser);
    };
  }, []);

  const setUser = (u: User) => {
    setUserState(u);
    if (u) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: u }));
  };

  const logout = () => {
    setUser(null);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("pp_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <AuthStoreCtx.Provider
      value={{
        user,
        isHydrated,
        setUser,
        logout,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthStoreCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthStoreCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
