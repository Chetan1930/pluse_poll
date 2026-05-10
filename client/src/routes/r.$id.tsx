import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useStore } from "@/lib/api-store";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Trophy, Users, ArrowLeft } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/r/$id")({
  head: () => ({ meta: [{ title: "Poll results — PulsePoll" }, { name: "description", content: "Public poll results" }] }),
  component: Results,
});

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function Results() {
  const { id } = Route.useParams();
  const { polls, getPoll } = useStore();
  const poll = polls.find((p) => p.id === id);
  const [loading, setLoading] = useState(!poll);

  useEffect(() => {
    setLoading(true);
    getPoll(id)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [getPoll, id]);

  if (!poll && loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
        <Card className="p-10 max-w-md text-center shadow-elegant border-border/60">
          <h2 className="text-2xl font-bold">Loading results...</h2>
        </Card>
      </div>
    );
  }

  if (!poll || !poll.resultsPublic) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
        <Card className="p-10 max-w-md text-center shadow-elegant border-border/60">
          <h2 className="text-2xl font-bold">Results not available</h2>
          <p className="text-muted-foreground mt-1">The creator hasn't published this poll's results yet.</p>
          <Button asChild className="mt-4"><Link to="/">Back home</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">PulsePoll</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 shadow-elegant border-border/60">
            <Badge variant="outline" className="bg-primary/15 text-primary border-primary/20">Final results</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{poll.title}</h1>
            <p className="text-muted-foreground mt-2">{poll.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {poll.responses.toLocaleString()} responses</span>
              <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4" /> {poll.questions.length} questions</span>
            </div>
          </Card>
        </motion.div>

        <div className="mt-4 space-y-4">
          {poll.questions.map((q, qi) => {
            const sum = q.options.reduce((s, o) => s + o.votes, 0) || 1;
            const sorted = [...q.options].sort((a, b) => b.votes - a.votes);
            const top = sorted[0];
            const data = q.options.map((o) => ({ name: o.text, votes: o.votes }));
            return (
              <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * qi }}>
                <Card className="p-6 shadow-soft border-border/60">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Q{qi + 1}</p>
                  <h3 className="mt-1 font-semibold text-lg">{q.text}</h3>
                  <div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Winner: </span>
                      <span className="font-semibold">{top?.text}</span>
                      <span className="text-muted-foreground"> · {Math.round((top.votes / sum) * 100)}% of votes</span>
                    </div>
                  </div>
                  <div className="h-64 mt-4 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                        <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                        <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                        <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Powered by <Link to="/" className="text-primary font-medium">PulsePoll</Link> — create your own poll in seconds.
        </div>
      </div>
    </div>
  );
}
