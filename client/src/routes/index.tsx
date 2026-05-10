import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap,
  Shield,
  Users,
  Globe,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulsePoll — Real-time polls & feedback that feel premium" },
      { name: "description", content: "Build beautiful polls in seconds. Get real-time responses, gorgeous analytics, and shareable results." },
    ],
  }),
  component: Landing,
});

const trendData = Array.from({ length: 24 }, (_, i) => ({
  t: `${i}h`,
  v: Math.round(40 + Math.sin(i / 2) * 20 + Math.random() * 30 + i * 3),
}));
const optionData = [
  { name: "React", v: 612 },
  { name: "Svelte", v: 244 },
  { name: "Vue", v: 218 },
  { name: "Solid", v: 174 },
];

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <LivePreview />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-70 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 text-primary">
            <Sparkles className="h-3 w-3" /> New: Realtime analytics 2.0
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
        >
          Polls that <span className="gradient-text">people actually</span>
          <br /> want to answer.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Build beautiful polls in seconds. Watch responses stream in live. Share gorgeous results
          with a single link. PulsePoll is the modern way to gather feedback.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" asChild className="gradient-primary shadow-elegant border-0 h-12 px-6 text-base">
            <Link to="/signup">Create a poll <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base">
            <Link to="/p/demo-1">View live demo</Link>
          </Button>
        </motion.div>
        <p className="mt-6 text-xs text-muted-foreground">
          No credit card required · Free forever for hobby projects
        </p>
      </div>
    </section>
  );
}

function LivePreview() {
  const [count, setCount] = useState(1248);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 4)), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="preview" className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 shadow-soft border-border/60 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Live responses</p>
                <p className="text-3xl font-bold tabular-nums mt-1">{count.toLocaleString()}</p>
              </div>
              <div className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
            <p className="mt-1 text-xs text-success font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12% this hour
            </p>
            <div className="h-32 mt-4 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card className="p-6 shadow-soft border-border/60 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Question results</p>
                <p className="text-base font-semibold mt-1">Which framework do you reach for first?</p>
              </div>
              <Badge className="gradient-primary border-0 text-primary-foreground">Realtime</Badge>
            </div>
            <div className="h-56 mt-4 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={optionData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="v" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Zap, title: "Lightning builder", desc: "Drag, type, ship. Build your poll in under a minute with our delightful editor." },
    { icon: BarChart3, title: "Beautiful analytics", desc: "Question-level breakdowns, trends, and exports — all out of the box." },
    { icon: Globe, title: "Realtime everywhere", desc: "Responses stream in live. Watch your dashboard update with smooth animations." },
    { icon: Shield, title: "Anonymous or signed-in", desc: "Choose how respondents authenticate per poll. Privacy-first by default." },
    { icon: Users, title: "Share anywhere", desc: "Beautiful public pages, embeds, and one-click published results." },
    { icon: CheckCircle2, title: "Validation built-in", desc: "Required questions, expiry handling, and clean states for every edge case." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
      <div className="text-center mb-12">
        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">Features</Badge>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">Everything you need, nothing you don't</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          A polling platform built on three principles: fast, beautiful, and respectful of your audience's time.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card className="p-6 h-full border-border/60 hover:shadow-elegant hover:border-primary/30 transition-all group">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl gradient-primary shadow-elegant p-10 md:p-16 text-center">
        <div className="absolute inset-0 opacity-30 gradient-mesh" />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground tracking-tight">
            Start collecting feedback today
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Join thousands of teams using PulsePoll to make better decisions, faster.
          </p>
          <Button size="lg" asChild className="mt-8 bg-background text-foreground hover:bg-background/90 h-12 px-7">
            <Link to="/signup">Create your first poll <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg gradient-primary" />
          <span className="font-semibold text-foreground">PulsePoll</span>
          <span>© 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}
