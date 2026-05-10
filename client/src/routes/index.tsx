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
  Layout,
  MousePointer2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulsePoll — Professional Feedback & Real-time Insights" },
      { name: "description", content: "The modern standard for gathering feedback. Create beautiful polls, analyze results in real-time, and make data-driven decisions." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <Navbar variant="marketing" />
      <main className="flex-1">
        <Hero />
        <ValueProp />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-40 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6 py-1 px-4 rounded-full border-primary/20 bg-primary/5 text-primary font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-2 inline" />
              Trusted by 500+ forward-thinking teams
            </Badge>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 leading-[1.1]"
          >
            Gather feedback that <span className="text-primary">actually matters.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            PulsePoll is the professional standard for real-time polling. Create beautiful, 
            high-conversion surveys and watch insights stream in instantly.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="h-14 px-8 text-lg rounded-2xl gradient-primary border-0 shadow-elegant hover:scale-[1.02] transition-transform">
              <Link to="/signup">Get started for free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg rounded-2xl border-border/60 hover:bg-accent/50">
              <Link to="/login">Sign in to dashboard</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ValueProp() {
  const props = [
    { icon: MousePointer2, title: "Frictionless", desc: "Respondents can answer in one click without creating an account." },
    { icon: Layout, title: "Modern UI", desc: "A clean, distraction-free interface designed for maximum engagement." },
    { icon: Globe, title: "Global Scale", desc: "Distributed infrastructure ensures your polls are fast, anywhere in the world." },
  ];

  return (
    <section className="py-20 border-y border-border/40 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          {props.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 rounded-2xl bg-background shadow-soft flex items-center justify-center mb-6 text-primary">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Zap,
      title: "Real-time Analytics",
      desc: "Watch your data come to life. Our live dashboard updates instantly as responses roll in.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      desc: "Advanced fraud detection and response validation keep your data clean and reliable.",
    },
    {
      icon: BarChart3,
      title: "Visual Insights",
      desc: "Beautifully rendered charts and exports make it easy to present your findings to stakeholders.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      desc: "Share access with your team and manage multiple polls from a centralized workspace.",
    },
    {
      icon: CheckCircle2,
      title: "Smart Validation",
      desc: "Ensure high-quality data with required questions and intelligent response filtering.",
    },
    {
      icon: Sparkles,
      title: "Custom Branding",
      desc: "Make every poll your own with customizable themes and professional styling options.",
    },
  ];

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Built for modern teams</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to gather, analyze, and act on feedback in one powerful platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-8 h-full border-border/60 hover:border-primary/30 hover:shadow-elegant transition-all group rounded-3xl bg-card/50 backdrop-blur-sm">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 container mx-auto px-4">
      <div className="relative overflow-hidden rounded-[2.5rem] gradient-primary p-12 md:p-20 text-center shadow-elegant">
        <div className="absolute inset-0 opacity-20 gradient-mesh" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 tracking-tight">
            Ready to elevate your feedback?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10">
            Join the thousands of professionals who trust PulsePoll for their most critical insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="h-14 px-10 text-lg rounded-2xl bg-background text-foreground hover:bg-background/90 shadow-soft">
              <Link to="/signup">Create your first poll</Link>
            </Button>
            <p className="text-sm text-primary-foreground/60">No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">PulsePoll</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact Support</a>
          </nav>
          
          <div className="text-sm text-muted-foreground">
            © 2026 PulsePoll Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}