import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, BarChart3, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/p/$id")({
  head: () => ({ meta: [{ title: "Poll — PulsePoll" }, { name: "description", content: "Answer this poll" }] }),
  component: PublicPoll,
});

function PublicPoll() {
  const { id } = Route.useParams();
  const { polls, vote } = useStore();
  const poll = polls.find((p) => p.id === id);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const expired = useMemo(() => poll?.expiresAt && new Date(poll.expiresAt) < new Date(), [poll]);

  if (!poll) {
    return (
      <Centered>
        <h2 className="text-2xl font-bold">Poll not found</h2>
        <p className="text-muted-foreground mt-1">This link may be incorrect or removed.</p>
        <Button asChild className="mt-4"><Link to="/">Back home</Link></Button>
      </Centered>
    );
  }

  if (expired) {
    return (
      <Centered>
        <div className="h-14 w-14 mx-auto rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
          <Clock className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold mt-4">Poll expired</h2>
        <p className="text-muted-foreground mt-1">This poll is no longer accepting responses.</p>
        {poll.resultsPublic && (
          <Button asChild className="mt-4 gradient-primary border-0"><Link to="/r/$id" params={{ id: poll.id }}>View results <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
        )}
      </Centered>
    );
  }

  if (submitted) {
    return (
      <Centered>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.6 }} className="h-16 w-16 mx-auto rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center shadow-elegant">
          <CheckCircle2 className="h-8 w-8" />
        </motion.div>
        <h2 className="text-3xl font-bold mt-4">Thanks for your answer!</h2>
        <p className="text-muted-foreground mt-1">Your response has been recorded.</p>
        <div className="mt-6 flex justify-center gap-2">
          {poll.resultsPublic && (
            <Button asChild className="gradient-primary border-0"><Link to="/r/$id" params={{ id: poll.id }}>See live results</Link></Button>
          )}
          <Button variant="outline" asChild><Link to="/">Back home</Link></Button>
        </div>
      </Centered>
    );
  }

  const submit = () => {
    for (const q of poll.questions) {
      if (q.required && !answers[q.id]) return toast.error(`Please answer: "${q.text}"`);
    }
    vote(poll.id, answers);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">PulsePoll</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="p-8 shadow-elegant border-border/60">
            <Badge variant="outline" className="bg-success/15 text-success border-success/20">Active</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{poll.title}</h1>
            <p className="text-muted-foreground mt-2">{poll.description}</p>
          </Card>
        </motion.div>

        <div className="mt-4 space-y-4">
          {poll.questions.map((q, qi) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * qi }}>
              <Card className="p-6 shadow-soft border-border/60">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Question {qi + 1} of {poll.questions.length}</p>
                <h3 className="mt-1 font-semibold text-lg">{q.text} {q.required && <span className="text-destructive">*</span>}</h3>
                <div className="mt-4 space-y-2">
                  {q.options.map((o) => {
                    const sel = answers[q.id] === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id]: o.id })}
                        className={cn(
                          "w-full text-left flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                          sel ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40 hover:bg-muted/30",
                        )}
                      >
                        <span className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          sel ? "border-primary" : "border-border",
                        )}>
                          {sel && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </span>
                        <span className="text-sm font-medium">{o.text}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button size="lg" onClick={submit} className="gradient-primary border-0 shadow-elegant h-12 px-8">
            Submit answer <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <Card className="p-10 max-w-md w-full text-center shadow-elegant border-border/60">{children}</Card>
    </div>
  );
}
