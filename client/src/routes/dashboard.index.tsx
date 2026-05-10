import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/api-store";
import { StatsCard } from "@/components/stats-card";
import { PollCard } from "@/components/poll-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BarChart3, CheckCircle2, Clock, FileText, Plus, Sparkles, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — PulsePoll" }, { name: "description", content: "Your polls and analytics" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { polls, loadingPolls, deletePoll } = useStore();
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "published">("all");
  const [q, setQ] = useState("");
  const [liveTotal, setLiveTotal] = useState(0);

  const totalResponses = useMemo(() => polls.reduce((s, p) => s + p.responses, 0), [polls]);
  useEffect(() => setLiveTotal(totalResponses), [totalResponses]);

  const stats = {
    total: polls.length,
    active: polls.filter((p) => p.status === "active").length,
    expired: polls.filter((p) => p.status === "expired").length,
    published: polls.filter((p) => p.status === "published").length,
  };

  const filtered = polls.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const trend = Array.from({ length: 14 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (13 - index));
    const key = day.toISOString().slice(0, 10);
    return {
      day: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      v: polls
        .filter((poll) => poll.createdAt.slice(0, 10) === key)
        .reduce((sum, poll) => sum + poll.responses, 0),
    };
  });

  const activity = polls.slice(0, 4).map((poll) => ({
    t: new Date(poll.createdAt).toLocaleDateString(),
    txt: `${poll.title} has ${poll.responses.toLocaleString()} responses`,
    icon: poll.resultsPublic ? CheckCircle2 : poll.status === "expired" ? Clock : Users,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Your polls and pulse — at a glance.</p>
        </div>
        <Button asChild className="gradient-primary border-0 shadow-elegant">
          <Link to="/dashboard/create"><Plus className="h-4 w-4 mr-1" /> New poll</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total polls" value={stats.total} icon={FileText} delay={0} />
        <StatsCard label="Total responses" value={liveTotal.toLocaleString()} icon={Users} accent="primary" trend="Backend" delay={0.05} />
        <StatsCard label="Active" value={stats.active} icon={Sparkles} accent="success" delay={0.1} />
        <StatsCard label="Published" value={stats.published} icon={CheckCircle2} accent="warning" delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 shadow-soft border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Response trends</h3>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" /> Backend
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-border/60">
          <h3 className="font-semibold">Recent activity</h3>
          <p className="text-xs text-muted-foreground">Latest pulse from your polls</p>
          <ul className="mt-4 space-y-3">
            {(activity.length ? activity : [{ t: "Now", txt: "Create your first poll to see activity here", icon: BarChart3 }]).map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 text-sm"
              >
                <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="leading-snug">{a.txt}</p>
                  <p className="text-xs text-muted-foreground">{a.t}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input placeholder="Filter by title…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
      </div>

      {loadingPolls ? (
        <Card className="p-12 text-center border-dashed border-border/60">
          <h3 className="font-semibold">Loading polls...</h3>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/60">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">No polls found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try a different filter, or create your first poll.</p>
          <Button asChild className="mt-4 gradient-primary border-0">
            <Link to="/dashboard/create"><Plus className="h-4 w-4 mr-1" /> New poll</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <PollCard key={p.id} poll={p} onDelete={deletePoll} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
