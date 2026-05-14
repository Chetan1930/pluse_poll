import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, ArrowRight, Zap, Share2, Eye, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulsePoll — Create polls & collect responses" },
      {
        name: "description",
        content: "Create polls, share a link, and watch results come in live.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    number: "1",
    icon: Zap,
    title: "Create",
    desc: "Write a question, add options, done.",
  },
  {
    number: "2",
    icon: Share2,
    title: "Share",
    desc: "Copy the link and send it anywhere.",
  },
  {
    number: "3",
    icon: Eye,
    title: "Watch",
    desc: "Results update live as people vote.",
  },
];

function Landing() {
  const { user, isHydrated } = useAuth();
  const loggedIn = isHydrated && !!user;

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Subtle background decorations */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/2 blur-3xl" />
        <div className="absolute top-[40%] left-[50%] w-[40%] h-[30%] rounded-full bg-primary/1 blur-3xl" />
      </div>

      <Navbar variant="marketing" />

      <main className="flex-1 relative">
        {/* ─── Hero ─── */}
        <section className="container mx-auto px-4 pt-28 pb-24 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live results · No refresh needed
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.08] mb-6">
              Polls that
              <br />
              <span className="gradient-text">people answer.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Create a poll in seconds, share a link, and watch responses pile up
              in real time. No accounts required to vote.
            </p>

            <div className="flex items-center justify-center gap-4">
              {loggedIn ? (
                <Button size="lg" asChild className="h-12 px-8 rounded-xl shadow-elegant gradient-primary border-0">
                  <Link to="/dashboard">
                    Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="h-12 px-8 rounded-xl shadow-elegant gradient-primary border-0">
                    <Link to="/signup" search={{ redirect: "" }}>
                      Get started free
                    </Link>
                  </Button>
                  <Button size="lg" variant="ghost" asChild className="h-12 px-6 rounded-xl">
                    <Link to="/login" search={{ redirect: "" }}>Sign in</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust signal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                No sign-up for voters
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Real-time results
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Free to use
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* ─── How it works ─── */}
        <section className="border-t border-border/50 relative">
          <div className="container mx-auto px-4 py-24 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4 }}
              className="text-center mb-16"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                How it works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
                Three clicks, that's it.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {steps.map((item, i) => (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.12, duration: 0.4 }}
                  className="relative group"
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gradient-to-r from-primary/20 to-transparent" aria-hidden="true" />
                  )}

                  <div className="relative flex flex-col items-center text-center">
                    {/* Icon with number badge */}
                    <div className="relative mb-5">
                      <div className="relative inline-flex">
                        <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300">
                          <item.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="absolute -top-2 -right-2 h-6 min-w-6 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center px-1 shadow-sm border-2 border-background">
                          {item.number}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="border-t border-border/50">
          <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to{" "}
                <span className="gradient-text">get started?</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first poll in under a minute. No credit card required.
              </p>
              {loggedIn ? (
                <Button size="lg" asChild className="h-12 px-8 rounded-xl shadow-elegant gradient-primary border-0">
                  <Link to="/dashboard">
                    Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="h-12 px-8 rounded-xl shadow-elegant gradient-primary border-0">
                  <Link to="/signup" search={{ redirect: "" }}>
                    Get started free
                  </Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50">
        <div className="container mx-auto px-4 py-8 max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <div className="h-6 w-6 rounded-lg gradient-primary flex items-center justify-center">
              <BarChart3 className="h-3 w-3 text-primary-foreground" />
            </div>
            PulsePoll
          </div>
          <p className="text-xs text-muted-foreground">
            Created by{" "}
            <a
              href="https://linkedin.com/in/chetan71"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Chetan
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
