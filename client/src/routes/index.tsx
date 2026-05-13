import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  Globe,
  Layout,
  MousePointer2,
  Zap,
  Shield,
  LineChart,
  Users,
  Clock,
  CheckCircle2,
  Quote,
  Star,
  Hash,
  Eye,
  TrendingUp,
  Layers,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulsePoll — Professional Feedback & Real-time Insights" },
      {
        name: "description",
        content:
          "The modern standard for gathering feedback. Create beautiful polls, analyze results in real-time, and make data-driven decisions.",
      },
    ],
  }),
  component: Landing,
});

// ─── Stagger container variant ──────────────────────────────────────
const stagger = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

// ─── Animated counter hook ───────────────────────────────────────────
function useCountUp(end: number, duration = 2, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration, hasStarted]);

  return { count, ref };
}

// ─── Floating particles ──────────────────────────────────────────────
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full"
          style={{
            background:
              i % 3 === 0
                ? "var(--color-primary)"
                : i % 3 === 1
                  ? "var(--color-chart-2)"
                  : "var(--color-chart-3)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Floating shapes ─────────────────────────────────────────────────
function FloatingShapes() {
  const shapes = [
    { icon: BarChart3, x: "15%", y: "20%", delay: 0, color: "var(--color-primary)" },
    { icon: Zap, x: "85%", y: "15%", delay: 0.5, color: "var(--color-chart-3)" },
    { icon: Users, x: "10%", y: "70%", delay: 1, color: "var(--color-chart-2)" },
    { icon: LineChart, x: "90%", y: "75%", delay: 1.5, color: "var(--color-chart-4)" },
    { icon: CheckCircle2, x: "50%", y: "10%", delay: 0.8, color: "var(--color-success)" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: s.x, top: s.y }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        >
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-soft backdrop-blur-sm"
            style={{
              background: `color-mix(in oklab, ${s.color} 12%, transparent)`,
              border: `1px solid color-mix(in oklab, ${s.color} 20%, transparent)`,
            }}
          >
            <s.icon className="h-5 w-5" style={{ color: s.color }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Poll preview mockup ─────────────────────────────────────────────
function PollPreviewMockup() {
  const options = [
    { label: "Remote-first culture", pct: 68, color: "var(--color-primary)" },
    { label: "Hybrid model", pct: 24, color: "var(--color-chart-2)" },
    { label: "Fully on-site", pct: 8, color: "var(--color-chart-3)" },
  ];

  return (
    <motion.div
      variants={scaleIn}
      className="relative mx-auto max-w-lg"
    >
      {/* Glow behind */}
      <div
        className="absolute -inset-8 rounded-[3rem] blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklab, var(--color-primary) 15%, transparent) 0%, transparent 70%)',
        }}
      />

      <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Handle bar */}
        <div className="h-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Live · 342 responses
            </div>
            <div className="flex -space-x-1">
              {[1, 2, 3].map((a) => (
                <div
                  key={a}
                  className="h-5 w-5 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground"
                >
                  {String.fromCharCode(64 + a)}
                </div>
              ))}
              <div className="h-5 w-5 rounded-full border-2 border-card bg-muted/60 flex items-center justify-center text-[9px] font-medium text-muted-foreground/60">
                +12
              </div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            What work model does your team prefer?
          </h3>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {options.map((opt, i) => (
            <motion.div
              key={opt.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.12 }}
              className="relative group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs mb-1.5 relative z-10 px-1">
                <span className="font-medium text-foreground">{opt.label}</span>
                <span className="text-muted-foreground font-semibold">{opt.pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: opt.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${opt.pct}%` }}
                  transition={{ duration: 1, delay: 0.8 + i * 0.15, ease: [0.21, 0.47, 0.32, 0.98] as const }}
                />
                {/* Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Closes in 3 days
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-3 w-3" />
            Public · Anonymous
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Component: Hero ─────────────────────────────────────────────────
function Hero() {
  const { user, isHydrated } = useAuth();
  const loggedIn = isHydrated && !!user;
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={heroRef}
      className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />
      <FloatingParticles />
      <FloatingShapes />

      {/* Radial spotlight */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklab, var(--color-primary) 8%, transparent) 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="container mx-auto px-4 relative z-10"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="max-w-xl"
          >
            <motion.div variants={fadeUp}>
              <Badge
                variant="outline"
                className="mb-6 py-1.5 px-4 rounded-full border-primary/20 bg-primary/5 text-primary font-medium inline-flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Trusted by 500+ forward-thinking teams
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]"
            >
              Gather feedback that{" "}
              <span className="gradient-text">actually matters.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg"
            >
              PulsePoll is the professional standard for real-time polling. Create
              beautiful, high-conversion surveys and watch insights stream in
              instantly — no training required.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              {loggedIn ? (
                <Button
                  size="lg"
                  asChild
                  className="h-14 px-8 text-lg rounded-2xl gradient-primary border-0 shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Link to="/dashboard">
                    Go to dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-8 text-lg rounded-2xl gradient-primary border-0 shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Link to="/signup" search={{ redirect: "" }}>
                      Get started free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-14 px-8 text-lg rounded-2xl border-border/60 hover:bg-accent/50 hover:border-accent-foreground/20 transition-all"
                  >
                    <Link to="/login" search={{ redirect: "" }}>Sign in</Link>
                  </Button>
                </>
              )}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex items-center gap-8 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No credit card
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Free tier included
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Cancel anytime
              </span>
            </motion.div>
          </motion.div>

          {/* Right — mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] as const }}
            className="hidden lg:block"
          >
            <PollPreviewMockup />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Component: Stats Bar ────────────────────────────────────────────
function StatsCard({ value, suffix, label, icon: Icon, delay }: {
  value: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}) {
  const { count, ref } = useCountUp(value, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span
        ref={ref}
        className="text-3xl md:text-4xl font-bold text-foreground tabular-nums"
      >
        {count.toLocaleString()}
        {suffix}
      </span>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

function StatsBar() {
  const stats = [
    { label: "Active polls", value: 12000, suffix: "+", icon: BarChart3 },
    { label: "Responses collected", value: 750000, suffix: "+", icon: Hash },
    { label: "Teams signed up", value: 500, suffix: "+", icon: Users },
    { label: "Avg. response rate", value: 89, suffix: "%", icon: TrendingUp },
  ];

  return (
    <section className="py-16 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <StatsCard
              key={s.label}
              value={s.value}
              suffix={s.suffix}
              label={s.label}
              icon={s.icon}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Component: How It Works ─────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: MousePointer2,
      title: "Create a poll",
      desc: "Choose from multiple question types, customize the design, and set your audience preferences in seconds.",
    },
    {
      num: "02",
      icon: Globe,
      title: "Share anywhere",
      desc: "Get a unique link to share via email, social media, or embed directly on your website or blog.",
    },
    {
      num: "03",
      icon: BarChart3,
      title: "Watch results stream in",
      desc: "Real-time analytics with beautiful charts, exportable data, and instant insights at your fingertips.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-primary/20 bg-primary/5 text-primary font-medium"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Simple workflow
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Three steps to insight
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From creation to insight in under a minute. No complicated dashboards or
            steep learning curves.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-20 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />

          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Number */}
              <div className="mx-auto mb-6 h-16 w-16 rounded-full gradient-primary flex items-center justify-center shadow-elegant">
                <span className="text-xl font-bold text-primary-foreground">{s.num}</span>
              </div>

              {/* Icon */}
              <div className="mb-4 mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="h-6 w-6 text-primary" />
              </div>

              <h3 className="text-xl font-semibold mb-3 text-foreground">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Component: Features ─────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Layout,
      title: "Beautiful builder",
      desc: "Drag-and-drop poll creation with rich formatting, image support, and customizable themes that match your brand.",
      gradient: "from-primary/20 via-primary/5 to-transparent",
    },
    {
      icon: LineChart,
      title: "Real-time analytics",
      desc: "Responses appear instantly on interactive charts. Filter by date, segment respondents, and export raw data with one click.",
      gradient: "from-chart-2/20 via-chart-2/5 to-transparent",
    },
    {
      icon: Shield,
      title: "Privacy-first",
      desc: "Anonymous response options, GDPR-compliant data handling, and granular access controls for every poll you create.",
      gradient: "from-success/20 via-success/5 to-transparent",
    },
    {
      icon: Zap,
      title: "Lightning fast",
      desc: "Edge-distributed infrastructure ensures sub-second load times for respondents anywhere in the world.",
      gradient: "from-chart-4/20 via-chart-4/5 to-transparent",
    },
    {
      icon: Layers,
      title: "Unlimited questions",
      desc: "Single-choice, multiple-choice, rating scales, open text — combine any question type in a single poll.",
      gradient: "from-chart-5/20 via-chart-5/5 to-transparent",
    },
    {
      icon: Users,
      title: "Team collaboration",
      desc: "Invite team members to co-manage polls, share analytics dashboards, and collaborate on insights in real time.",
      gradient: "from-chart-3/20 via-chart-3/5 to-transparent",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-muted/20 border-y border-border/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-primary/20 bg-primary/5 text-primary font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Everything you need
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Packed with powerful features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every tool you need to create, distribute, and analyze polls — without
            the bloat.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Card className="h-full p-6 border-border/50 hover:border-primary/20 hover:shadow-elegant transition-all duration-300 relative overflow-hidden">
                {/* Hover gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${f.gradient})`,
                  }}
                />

                <div className="relative z-10">
                  <div className="mb-4 h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Component: Testimonials ─────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      quote:
        "We switched from SurveyMonkey to PulsePoll and our response rates went up 40%. The real-time charts alone are worth it.",
      name: "Sarah Chen",
      role: "Product Manager, Vercel",
      initials: "SC",
    },
    {
      quote:
        "The simplest polling experience I've ever used. We run weekly team health checks and PulsePoll makes it effortless.",
      name: "Marcus Johnson",
      role: "Engineering Lead, Stripe",
      initials: "MJ",
    },
    {
      quote:
        "Our clients love the embedded polls. The analytics dashboard has become our go-to for quarterly stakeholder reports.",
      name: "Priya Patel",
      role: "Design Director, Figma",
      initials: "PP",
    },
  ];

  const [active, setActive] = useState(0);

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-primary/20 bg-primary/5 text-primary font-medium"
          >
            <Star className="h-3.5 w-3.5 mr-1.5" />
            Loved by teams
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Trusted by industry leaders
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[240px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <Quote className="h-8 w-8 text-primary/30 mx-auto mb-6" />
                <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8 font-medium">
                  &ldquo;{testimonials[active].quote}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">
                      {testimonials[active].initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {testimonials[active].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonials[active].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Component: CTA ──────────────────────────────────────────────────
function CTA() {
  const { user, isHydrated } = useAuth();
  const loggedIn = isHydrated && !!user;

  return (
    <section className="py-24 md:py-32 bg-muted/20 border-t border-border/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] gradient-primary p-12 md:p-20 text-center shadow-elegant"
        >
          {/* Decorative mesh overlay */}
          <div className="absolute inset-0 opacity-20 gradient-mesh pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Badge className="mb-6 rounded-full bg-white/15 text-white border-white/20 font-medium">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {loggedIn ? "Welcome back" : "Get started today"}
              </Badge>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 tracking-tight"
            >
              {loggedIn
                ? "Back to your polls"
                : "Ready to elevate your feedback?"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto"
            >
              {loggedIn
                ? "Continue building, analyzing, and sharing your polls."
                : "Join the thousands of professionals who trust PulsePoll for their most critical insights."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {loggedIn ? (
                <Button
                  size="lg"
                  asChild
                  className="h-14 px-10 text-lg rounded-2xl bg-background text-foreground hover:bg-background/90 shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Link to="/dashboard">
                    Go to dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-10 text-lg rounded-2xl bg-background text-foreground hover:bg-background/90 shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Link to="/signup" search={{ redirect: "" }}>
                      Create your first poll <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                    <CheckCircle2 className="h-4 w-4" />
                    No credit card required
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Component: Footer ───────────────────────────────────────────────
function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Integrations", "Changelog"],
    },
    {
      title: "Resources",
      links: ["Documentation", "API Reference", "Blog", "Community"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Privacy Policy", "Terms of Service"],
    },
  ];

  return (
    <footer className="border-t border-border/40 bg-muted/10">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group mb-5">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">PulsePoll</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The professional standard for real-time polling and feedback collection.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-accent/30 transition-all"
                  aria-label={`Social link ${i + 1}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {sections.map((sec) => (
            <div key={sec.title}>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                {sec.title}
              </h4>
              <ul className="space-y-3">
                {sec.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} PulsePoll. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-success" />
              GDPR compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              SOC 2 certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Simple SVG icon components for social links ─────────────────────
function Twitter(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function Github(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function Linkedin(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Main landing page ──────────────────────────────────────────────
function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <Navbar variant="marketing" />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
