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

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — PulsePoll" },
      { name: "description", content: "Create your PulsePoll account" },
    ],
  }),
  component: Signup,
});

const passwordStrength = (pw: string) => {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/\d/.test(pw)) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[^a-zA-Z\d]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "text-destructive", "text-orange-500", "text-yellow-500", "text-success"];
  return { score, label: labels[score], color: colors[score] };
};

function Signup() {
  const { register, user, authReady } = useStore();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});

  // Redirect authenticated users away from signup page
  useEffect(() => {
    if (authReady && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, authReady, navigate]);

  const strength = passwordStrength(pw);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (name.trim().length < 2) e2.name = "Tell us your name (at least 2 characters)";
    if (!/^\S+@\S+\.\S+$/.test(email)) e2.email = "Enter a valid email address";
    if (pw.length < 8) e2.pw = "Password must be at least 8 characters";
    else if (!/\d/.test(pw)) e2.pw = "Password must contain at least one number";
    setErrs(e2);
    if (Object.keys(e2).length) return;
    try {
      await register(name, email, pw);
      toast.success("Account created — welcome!");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account");
    }
  };

  // Don't flash form while checking existing session
  if (!authReady) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
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
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Start collecting feedback in minutes
            </p>

            <form onSubmit={submit} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5"
                  autoComplete="name"
                />
                {errs.name && <p className="text-xs text-destructive mt-1">{errs.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  autoComplete="email"
                />
                {errs.email && <p className="text-xs text-destructive mt-1">{errs.email}</p>}
              </div>
              <div>
                <Label htmlFor="pw">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="pw"
                    type={show ? "text" : "password"}
                    placeholder="Min 8 characters, includes a number"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    autoComplete="new-password"
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
                {pw && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            strength.score >= s ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <span className={`text-xs font-medium ${strength.color}`}>
                        {strength.label}
                      </span>
                    )}
                  </div>
                )}
                {errs.pw && <p className="text-xs text-destructive mt-1">{errs.pw}</p>}
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary border-0 shadow-elegant h-11"
              >
                Create account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>

      <div className="relative hidden lg:flex flex-col justify-between p-12 gradient-primary text-primary-foreground overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <Link to="/" className="relative flex items-center gap-2 ml-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/20 backdrop-blur">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">PulsePoll</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">
            Join 12,000+ teams making better decisions with realtime feedback.
          </h2>
          <ul className="mt-6 space-y-2 text-primary-foreground/90">
            <li>✓ Unlimited polls on the free plan</li>
            <li>✓ Beautiful realtime analytics</li>
            <li>✓ Anonymous responses out of the box</li>
          </ul>
        </div>
        <div className="relative text-sm text-primary-foreground/70">© 2026 PulsePoll</div>
      </div>
    </div>
  );
}
