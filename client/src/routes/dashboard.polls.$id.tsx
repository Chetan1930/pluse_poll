import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/mock-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/stats-card";
import { ArrowLeft, BarChart3, Globe2, Share2, Trash2, Trophy, Users, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/polls/$id")({
  head: () => ({ meta: [{ title: "Poll analytics — PulsePoll" }, { name: "description", content: "Realtime poll analytics" }] }),
  component: Analytics,
});

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function Analytics() {
  const { id } = Route.useParams();
  const { polls, updatePoll, deletePoll } = useStore();
  const poll = polls.find((p) => p.id === id);
  const navigate = useNavigate();
  const [liveResp, setLiveResp] = useState(poll?.responses ?? 0);

  useEffect(() => { if (poll) setLiveResp(poll.responses); }, [poll?.responses]);
  useEffect(() => {
    const id = setInterval(() => setLiveResp((c) => c + Math.floor(Math.random() * 2)), 2500);
    return () => clearInterval(id);
  }, []);

  if (!poll) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold">Poll not found</h2>
        <Button asChild className="mt-4"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }

  const totalVotes = poll.questions[0]?.options.reduce((s, o) => s + o.votes, 0) || 1;
  const top = [...(poll.questions[0]?.options || [])].sort((a, b) => b.votes - a.votes)[0];

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${poll.id}`);
    toast.success("Public link copied");
  };
  const publish = () => {
    updatePoll(poll.id, { status: "published", resultsPublic: true });
    toast.success("Results published");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" /> Dashboard</Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={
                poll.status === "active" ? "bg-success/15 text-success border-success/20" :
                poll.status === "published" ? "bg-primary/15 text-primary border-primary/20" :
                "bg-muted text-muted-foreground"
              }>{poll.status}</Badge>
              {poll.anonymous && <Badge variant="outline">Anonymous</Badge>}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">{poll.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{poll.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyLink}><Share2 className="h-4 w-4 mr-1" /> Share</Button>
            {poll.resultsPublic ? (
              <Button asChild variant="outline"><Link to="/r/$id" params={{ id: poll.id }}><Globe2 className="h-4 w-4 mr-1" /> Public results</Link></Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gradient-primary border-0 shadow-elegant"><Trophy className="h-4 w-4 mr-1" /> Publish results</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publish results publicly?</DialogTitle>
                    <DialogDescription>Anyone with the link will be able to see final vote counts and charts. You can unpublish later.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={publish} className="gradient-primary border-0">Publish</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Dialog>
              <DialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete this poll?</DialogTitle>
                  <DialogDescription>This action can't be undone. All responses will be lost.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={() => { deletePoll(poll.id); navigate({ to: "/dashboard" }); }}>Delete poll</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total responses" value={liveResp.toLocaleString()} icon={Users} accent="primary" trend="● Live" />
        <StatsCard label="Participation" value={`${Math.min(99, Math.round((liveResp / 2000) * 100))}%`} icon={Zap} accent="success" delay={0.05} />
        <StatsCard label="Top option" value={top?.text || "—"} icon={Trophy} accent="warning" delay={0.1} />
        <StatsCard label="Questions" value={poll.questions.length} icon={BarChart3} delay={0.15} />
      </div>

      <div className="space-y-4">
        {poll.questions.map((q, qi) => {
          const data = q.options.map((o) => ({ name: o.text, votes: o.votes }));
          const sum = q.options.reduce((s, o) => s + o.votes, 0) || 1;
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.05 }}>
              <Card className="p-6 shadow-soft border-border/60">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">Q{qi + 1}</Badge>
                  <span className="text-xs text-muted-foreground">{sum.toLocaleString()} votes</span>
                </div>
                <h3 className="font-semibold text-lg">{q.text}</h3>
                <div className="grid gap-6 lg:grid-cols-2 mt-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
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
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data} dataKey="votes" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {q.options.map((o, i) => {
                    const pct = Math.round((o.votes / sum) * 100);
                    return (
                      <div key={o.id} className="flex items-center gap-3 text-sm">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="flex-1 truncate">{o.text}</span>
                        <span className="font-medium tabular-nums">{o.votes.toLocaleString()}</span>
                        <span className="text-muted-foreground tabular-nums w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
