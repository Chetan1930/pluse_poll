import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/lib/api-store";
import { getFirstValidationMessage, loginFormSchema } from "@/lib/validation";
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

const floatingShapes = [
  { size: 72, x: "8%", y: "15%", delay: 0, duration: 6 },
  { size: 48, x: "75%", y: "10%", delay: 1.5, duration: 5 },
  { size: 96, x: "82%", y: "55%", delay: 3, duration: 7 },
  { size: 40, x: "15%", y: "72%", delay: 0.8, duration: 4.5 },
  { size: 56, x: "55%", y: "80%", delay: 2.2, duration: 5.5 },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  },
};

function Login() {
  const { login, user, authReady } = useStore();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authReady && user) {
      navigate({ to: (redirect as any) || "/dashboard" });
    }
  }, [user, authReady, navigate, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginFormSchema.safeParse({ email, password: pw });
    if (!parsed.success) {
      return toast.error(getFirstValidationMessage(parsed.error));
    }

    setLoading(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      toast.success("Welcome back!");
      navigate({ to: (redirect as any) || "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  if (!authReady) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Decorative panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 gradient-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingShapes.map((shape, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-white/10"
              style={{
                width: shape.size,
                height: shape.size,
                left: shape.x,
                top: shape.y,
              }}
              animate={{
                y: [0, -(15 + i * 3), 0],
                scale: [1, 1.08, 1],
                opacity: [0.08, 0.2, 0.08],
              }}
              transition={{
                duration: shape.duration,
                repeat: Infinity,
                delay: shape.delay,
                ease: "easeInOut" as const,
              }}
            />
          ))}

          {/* Animated mini bar chart */}
          <div className="absolute bottom-48 left-10 flex items-end gap-2.5">
            {[35, 55, 42, 75, 60, 45].map((h, i) => (
              <motion.div
                key={i}
                className="w-3 rounded-t-sm"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  height: `${h}px`,
                }}
                animate={{ height: [`${h}px`, `${h + 28}px`, `${h}px`] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.35,
                  ease: "easeInOut" as const,
                }}
              />
            ))}
          </div>

          {/* Small animated dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute h-2 w-2 rounded-full bg-white/15"
              style={{ left: `${30 + i * 15}%`, bottom: "32%" }}
              animate={{ opacity: [0, 0.5, 0], scale: [0, 1.5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 1.3,
                ease: "easeInOut" as const,
              }}
            />
          ))}
        </div>

        <Link to="/" className="relative flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm group-hover:bg-white/25 transition-colors">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">PulsePoll</span>
        </Link>

        <div className="relative space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + star * 0.08, type: "spring", stiffness: 300 }}
                >
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </motion.div>
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-bold leading-tight">
              &ldquo;PulsePoll completely changed how our team gathers feedback. It feels
              effortless.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                MC
              </div>
              <div>
                <p className="font-medium text-sm">Maya Chen</p>
                <p className="text-xs text-primary-foreground/70">Head of Product, Northwind</p>
              </div>
            </div>
          </motion.div>
          <div className="flex gap-6 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> 12K+ teams
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Real-time analytics
            </span>
          </div>
        </div>

        <div className="relative text-sm text-primary-foreground/60">&copy; 2026 PulsePoll</div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-12">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.5_0.2_240/0.06),transparent_50%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          <Card className="p-8 sm:p-10 shadow-elegant border-border/60">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">PulsePoll</span>
            </div>

            <motion.div
              variants={stagger.container}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              <motion.div variants={stagger.item}>
                <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Sign in to your PulsePoll account
                </p>
              </motion.div>

              <form onSubmit={submit} className="space-y-5">
                <motion.div variants={stagger.item}>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                      required
                      autoComplete="email"
                    />
                  </div>
                </motion.div>

                <motion.div variants={stagger.item}>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pw">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="pw"
                      type={show ? "text" : "password"}
                      placeholder="Your password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      className="pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={show ? "Hide password" : "Show password"}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={stagger.item}>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={(v) => setRemember(v === true)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                </motion.div>

                <motion.div variants={stagger.item}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-primary border-0 shadow-elegant h-12 text-base font-medium relative overflow-hidden group"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" as const }}
                          className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                        />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign in
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.p
                variants={stagger.item}
                className="text-center text-sm text-muted-foreground"
              >
                No account?{" "}
                <Link
                  to="/signup"
                  search={redirect ? ({ redirect } as any) : undefined}
                  className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5 group"
                >
                  Sign up
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.p>
            </motion.div>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground transition-colors">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
