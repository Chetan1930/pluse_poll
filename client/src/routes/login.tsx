import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/api-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in - PulsePoll" },
      { name: "description", content: "Sign in to PulsePoll" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? "",
  }),
  component: Login,
});

function Login() {
  const { login, user, authReady } = useStore();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (authReady && user) {
      navigate({ to: (redirect as any) || "/dashboard" });
    }
  }, [user, authReady, navigate, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email");
    if (!pw) return toast.error("Password is required");

    setLoading(true);
    try {
      await login(email, pw);
      toast.success("Welcome back!");
      navigate({ to: (redirect as any) || "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  // Don't flash form while checking existing session
  if (!authReady) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex flex-col justify-between p-12 gradient-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/20 backdrop-blur">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">PulsePoll</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">
            "PulsePoll completely changed how our team gathers feedback. It feels effortless."
          </h2>
          <p className="mt-6 text-primary-foreground/80">
            — Maya Chen, Head of Product at Northwind
          </p>
        </div>
        <div className="relative text-sm text-primary-foreground/70">© 2026 PulsePoll</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-elegant border-border/60">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">PulsePoll</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your PulsePoll account</p>

            <form onSubmit={submit} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw">Password</Label>
                </div>
                <div className="relative mt-1.5">
                  <Input
                    id="pw"
                    type={show ? "text" : "password"}
                    placeholder="Your password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary border-0 shadow-elegant h-11"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
