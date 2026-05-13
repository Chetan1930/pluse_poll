import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, ArrowRight } from "lucide-react";
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

function Landing() {
  const { user, isHydrated } = useAuth();
  const loggedIn = isHydrated && !!user;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="marketing" />

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-24 pb-20 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Polls that people<br />actually answer.
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
            Create a poll in seconds, share a link, and see responses come in
            live. No accounts required to vote.
          </p>

          <div className="flex items-center gap-4">
            {loggedIn ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/signup" search={{ redirect: "" }}>
                    Get started
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link to="/login" search={{ redirect: "" }}>Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border/50">
          <div className="container mx-auto px-4 py-20 max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-12">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  step: "1",
                  title: "Create",
                  desc: "Write a question, add your options, and you're done.",
                },
                {
                  step: "2",
                  title: "Share",
                  desc: "Copy the link and send it anywhere — chat, email, wherever.",
                },
                {
                  step: "3",
                  title: "Watch",
                  desc: "Results update live as people vote. No refresh needed.",
                },
              ].map((item) => (
                <div key={item.step}>
                  <span className="text-4xl font-bold text-border">{item.step}</span>
                  <h3 className="text-lg font-semibold text-foreground mt-3 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50">
        <div className="container mx-auto px-4 py-8 max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="h-4 w-4" />
            PulsePoll
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PulsePoll
          </p>
        </div>
      </footer>
    </div>
  );
}
