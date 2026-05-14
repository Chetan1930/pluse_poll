import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  UserPlus,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/api-store";
import { signupFormSchema } from "@/lib/validation";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — PulsePoll" },
      { name: "description", content: "Create your PulsePoll account" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? "",
  }),
  component: Signup,
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

const passwordStrength = (pw: string) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/\d/.test(pw)) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[^a-zA-Z\d]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "text-destructive", "text-orange-500", "text-amber-500", "text-emerald-500"];
  return { score, label: labels[score], color: colors[score] };
};

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Uppercase & lowercase", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "Special character", test: (p: string) => /[^a-zA-Z\d]/.test(p) },
];

function Signup() {
  const { register, user, authReady } = useStore();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Redirect authenticated users away from signup page
  useEffect(() => {
    if (authReady && user) {
      navigate({ to: (redirect as any) || "/dashboard" });
    }
  }, [user, authReady, navigate, redirect]);

  const strength = passwordStrength(pw);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupFormSchema.safeParse({ name, email, password: pw });

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      setErrs({
        name: fieldErrors.name?.[0] || "",
        email: fieldErrors.email?.[0] || "",
        pw: fieldErrors.password?.[0] || "",
      });
      return;
    }

    setErrs({});

    setLoading(true);
    try {
      await register(parsed.data.name, parsed.data.email, parsed.data.password);
      toast.success("Account created — welcome!");
      navigate({ to: (redirect as any) || "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  // Don't flash form while checking existing session
  if (!authReady) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.5_0.2_240/0.06),transparent_50%)] pointer-events-none" />

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
                <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Start collecting feedback in minutes
                </p>
              </motion.div>

              <form onSubmit={submit} className="space-y-5">
                <motion.div variants={stagger.item}>
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="name"
                      placeholder="Chetan Chauhan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                      autoComplete="name"
                    />
                  </div>
                  {errs.name && (
                    <p className="text-xs text-destructive mt-1">{errs.name}</p>
                  )}
                </motion.div>

                <motion.div variants={stagger.item}>
                  <Label htmlFor="email">Work email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@chetan.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                      required
                      autoComplete="email"
                    />
                  </div>
                  {errs.email && (
                    <p className="text-xs text-destructive mt-1">{errs.email}</p>
                  )}
                </motion.div>

                <motion.div variants={stagger.item}>
                  <Label htmlFor="pw">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="pw"
                      type={show ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      className="pl-10 h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                      required
                      autoComplete="new-password"
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

                  {/* Password strength bar */}
                  {pw && (
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((s) => (
                          <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              strength.score >= s ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Requirements checklist */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {requirements.map((req) => {
                          const met = req.test(pw);
                          return (
                            <div
                              key={req.label}
                              className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                                met ? "text-emerald-500" : "text-muted-foreground"
                              }`}
                            >
                              <Check
                                className={`h-3 w-3 shrink-0 transition-all ${
                                  met
                                    ? "opacity-100 scale-100"
                                    : "opacity-0 scale-0"
                                }`}
                              />
                              <div
                                className={`h-1 w-1 rounded-full shrink-0 transition-all ${
                                  met ? "opacity-0 scale-0" : "opacity-100 scale-100"
                                }`}
                              >
                                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                              </div>
                              {req.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {errs.pw && (
                    <p className="text-xs text-destructive mt-1">{errs.pw}</p>
                  )}
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
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Create account
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.p
                variants={stagger.item}
                className="text-center text-sm text-muted-foreground"
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  search={redirect ? ({ redirect } as any) : undefined}
                  className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5 group"
                >
                  Sign in
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.p>
            </motion.div>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
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

      {/* Decorative panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 gradient-primary text-primary-foreground overflow-hidden order-1 lg:order-2">
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

          {/* Animated dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute h-2 w-2 rounded-full bg-white/15"
              style={{ left: `${25 + i * 18}%`, top: "38%" }}
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Join 12,000+ teams making better decisions with realtime feedback.
            </h2>
            <ul className="mt-8 space-y-3">
              {[
                { icon: BarChart3, text: "Beautiful realtime analytics" },
                { icon: Sparkles, text: "Unlimited polls on the free plan" },
                { icon: Check, text: "Anonymous responses out of the box" },
              ].map((item, i) => (
                <motion.li
                  key={item.text}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 text-primary-foreground/90"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span>{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <div className="flex gap-6 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> Free forever
            </span>
          </div>
        </div>

        <div className="relative text-sm text-primary-foreground/60">
          Created by{" "}
          <a
            href="https://linkedin.com/in/chetan71"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-foreground/80 hover:text-white transition-colors underline underline-offset-2 decoration-white/20"
          >
            Chetan
          </a>
        </div>
      </div>
    </div>
  );
}
