import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type User = { _id: string; name: string; email: string } | null;

type AuthCtx = {
  user: User;
  isHydrated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const AuthStoreCtx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const u = localStorage.getItem("pp_user");
    if (u) {
      try {
        setUserState(JSON.parse(u));
      } catch (e) {
        localStorage.removeItem("pp_user");
      }
    }

    const t = (localStorage.getItem("pp_theme") as "light" | "dark") || "light";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    
    setIsHydrated(true);
  }, []);

  const setUser = (u: User) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("pp_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("pp_user");
    }
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
        toggleTheme 
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