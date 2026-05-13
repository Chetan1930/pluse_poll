import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/api-store";
import { StatsCard } from "@/components/stats-card";
import { PollCard } from "@/components/poll-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Sparkles,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Waves,
  Hash,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type PollFilter = "all" | "active" | "expired" | "published";
type SortKey = "newest" | "oldest" | "responses";

const searchSchema = z.object({ q: z.string().default("") });

export const Route = createFileRoute("/dashboard/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Dashboard - PulsePoll" },
      { name: "description", content: "Your polls and analytics" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { polls, loadingPolls, deletePoll, user } = useStore();
  const navigate = useNavigate();
  const { q } = Route.useSearch();
  const [filter, setFilter] = useState<PollFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const setQ = (val: string) =>
    navigate({ to: "/dashboard", search: (prev) => ({ ...prev, q: val }), replace: true });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = useMemo(
    () => ({
      total: polls.length,
      responses: polls.reduce((s, p) => s + (p.responses || 0), 0),
      active: polls.filter((p) => !p.expiresAt || new Date(p.expiresAt) > new Date()).length,
      published: polls.filter((p) => p.resultsPublic).length,
    }),
    [polls],
  );

  // Trend data: last 14 days of response activity
  const trend = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().slice(0, 10);
    });

    const responseCounts = polls.reduce(
      (counts, poll) => {
        poll.responseHistory.forEach((entry) => {
          counts[entry.date] = (counts[entry.date] || 0) + entry.count;
        });
        return counts;
      },
      {} as Record<string, number>,
    );

    return days.map((key) => ({
      day: new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      v: responseCounts[key] || 0,
    }));
  }, [polls]);

  // Calculate trend percentage (compare last 7 days vs previous 7 days)
  const trendPct = useMemo(() => {
    const firstWeek = trend.slice(0, 7).reduce((s, d) => s + d.v, 0) || 0;
    const lastWeek = trend.slice(7).reduce((s, d) => s + d.v, 0) || 0;
    return firstWeek > 0
      ? Math.round(((lastWeek - firstWeek) / firstWeek) * 100)
      : lastWeek > 0
        ? 100
        : 0;
  }, [trend]);

  const isTrendUp = trendPct >= 0;

  const filtered = useMemo(() => {
    let result = [...polls];

    // Filter
    result = result.filter((p) => {
      const isExpired = p.expiresAt && new Date(p.expiresAt) < new Date();
      if (filter === "active" && isExpired) return false;
      if (filter === "expired" && !isExpired) return false;
      if (filter === "published" && !p.resultsPublic) return false;
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return (b.responses || 0) - (a.responses || 0);
    });

    return result;
  }, [polls, filter, q, sort]);

  const handleDelete = async (id: string) => {
    try {
      await deletePoll(id);
      toast.success("Poll deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete poll");
    }
  };

  // Activity feed
  const activity = useMemo(
    () =>
      polls.slice(0, 4).map((poll) => {
        const timeAgo = (() => {
          const diff = Date.now() - new Date(poll.createdAt).getTime();
          const mins = Math.floor(diff / 60000);
          if (mins < 1) return "Just now";
          if (mins < 60) return `${mins}m ago`;
          const hours = Math.floor(mins / 60);
          if (hours < 24) return `${hours}h ago`;
          const days = Math.floor(hours / 24);
          if (days < 7) return `${days}d ago`;
          return new Date(poll.createdAt).toLocaleDateString();
        })();

        let icon = Users;
        let iconBg = "bg-primary/10 text-primary";
        let label = "New responses";

        if (poll.resultsPublic) {
          icon = BarChart3;
          iconBg = "bg-success/10 text-success";
          label = "Published";
        } else if (poll.status === "expired") {
          icon = Clock;
          iconBg = "bg-muted-foreground/10 text-muted-foreground";
          label = "Expired";
        } else if (poll.status === "active") {
          icon = Sparkles;
          iconBg = "bg-primary/10 text-primary";
          label = "Active";
        }

        return {
          id: poll.id,
          label,
          title: poll.title,
          responses: poll.responses,
          timeAgo,
          icon,
          iconBg,
        };
      }),
    [polls],
  );

  if (loadingPolls) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting},
            <span className="gradient-text ml-2">{user?.name?.split(" ")[0] || "there"}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {polls.length === 0
              ? "Let's create your first poll — it only takes a minute."
              : `You have ${stats.active} active poll${stats.active !== 1 ? "s" : ""} and ${stats.responses.toLocaleString()} total response${stats.responses !== 1 ? "s" : ""}.`}
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button asChild className="gradient-primary border-0 shadow-elegant h-11">
            <Link to="/dashboard/create">
              <Plus className="h-4 w-4 mr-1.5" /> New poll
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total polls" value={stats.total} icon={FileText} delay={0} />
        <StatsCard
          label="Total responses"
          value={stats.responses.toLocaleString()}
          icon={Users}
          accent="primary"
          delay={0.05}
        />
        <StatsCard label="Active polls" value={stats.active} icon={Sparkles} accent="success" delay={0.1} />
        <StatsCard
          label="Published"
          value={stats.published}
          icon={CheckCircle2}
          accent="warning"
          delay={0.15}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Response trends chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 shadow-soft border-border/60 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Response trends</h3>
                  {trendPct !== 0 && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                        isTrendUp
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isTrendUp ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(trendPct)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Last 14 days</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Waves className="h-3.5 w-3.5 text-primary/60" />
                <span>Real-time</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "var(--shadow-soft)",
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#trendFill)"
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-6 shadow-soft border-border/60 h-full">
            <h3 className="font-semibold">Recent activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Latest from your polls</p>

            <div className="mt-4 space-y-1">
              {activity.length > 0 ? (
                activity.map((a, i) => (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    onClick={() => navigate({ to: "/dashboard/polls/$id", params: { id: a.id } })}
                    className="flex items-start gap-3 w-full text-left rounded-xl p-2.5 hover:bg-muted/40 transition-colors group"
                  >
                    <div
                      className={`h-9 w-9 shrink-0 rounded-xl ${a.iconBg} flex items-center justify-center`}
                    >
                      <a.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate group-hover:text-primary transition-colors">
                        {a.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground/70">{a.label}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                          <Hash className="h-2.5 w-2.5" />
                          {a.responses} responses
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground/50 shrink-0 mt-0.5">
                      {a.timeAgo}
                    </span>
                  </motion.button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/5 text-primary/40 flex items-center justify-center">
                    <Waves className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Activity will appear here once your polls start getting responses.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters + Sort + Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as PollFilter)}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs">
                Active
              </TabsTrigger>
              <TabsTrigger value="published" className="text-xs">
                Published
              </TabsTrigger>
              <TabsTrigger value="expired" className="text-xs">
                Expired
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-[130px] text-xs rounded-xl gap-1">
              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest" className="text-xs">
                Newest
              </SelectItem>
              <SelectItem value="oldest" className="text-xs">
                Oldest
              </SelectItem>
              <SelectItem value="responses" className="text-xs">
                Most responses
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Search polls..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs h-9 text-sm rounded-xl"
          aria-label="Search polls"
        />
      </motion.div>

      {/* Polls grid or empty state */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-14 text-center border-dashed border-border/60">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/5 text-primary/50 flex items-center justify-center">
              {q || filter !== "all" ? (
                <BarChart3 className="h-7 w-7" />
              ) : (
                <Waves className="h-7 w-7" />
              )}
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              {q || filter !== "all" ? "No polls match your criteria" : "No polls yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
              {q || filter !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Create your first poll to start collecting feedback and watching results come in real-time."}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {(q || filter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ("");
                    setFilter("all");
                  }}
                  className="rounded-xl"
                >
                  Clear filters
                </Button>
              )}
              {!q && filter === "all" && (
                <Button asChild className="gradient-primary border-0 shadow-elegant rounded-xl">
                  <Link to="/dashboard/create">
                    <Plus className="h-4 w-4 mr-1" /> Create poll
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <PollCard poll={p} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
