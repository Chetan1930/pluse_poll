import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore, type Question } from "@/lib/api-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/stats-card";
import { EditPollDialog } from "@/components/edit-poll-dialog";
import { usePollSocket, type PollUpdatedPayload } from "@/hooks/use-poll-socket";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Clock,
  Globe2,
  Pencil,
  Share2,
  ShieldAlert,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  Wifi,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const Route = createFileRoute("/dashboard/polls/$id")({
  head: () => ({
    meta: [
      { title: "Poll analytics — PulsePoll" },
      { name: "description", content: "Realtime poll analytics" },
    ],
  }),
  component: Analytics,
});

function getTimeLeft(expiresAt: string | null | undefined): string {
  if (!expiresAt) return "No expiry";
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m left`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h left`;
}

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Analytics() {
  const { id } = Route.useParams();
  const { polls, getPoll, publishPoll, deletePoll } = useStore();
  const poll = polls.find((p) => p.id === id);
  const navigate = useNavigate();

  // Live state updated by both initial load and socket events
  const [liveResp, setLiveResp] = useState(poll?.responses ?? 0);
  const [liveQuestions, setLiveQuestions] = useState<Question[]>(poll?.questions ?? []);
  const [isLive, setIsLive] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Keep live state in sync when poll loads from API
  useEffect(() => {
    if (poll) {
      setLiveResp(poll.responses);
      setLiveQuestions(poll.questions);
    }
  }, [poll]);

  // Time-remaining ticker — updates every minute
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(poll?.expiresAt));
  useEffect(() => {
    setTimeLeft(getTimeLeft(poll?.expiresAt));
    const t = setInterval(() => setTimeLeft(getTimeLeft(poll?.expiresAt)), 60_000);
    return () => clearInterval(t);
  }, [poll?.expiresAt]);

  const timeAccent = useMemo(() => {
    if (!poll?.expiresAt) return "primary" as const;
    const diff = new Date(poll.expiresAt).getTime() - Date.now();
    if (diff <= 0) return "destructive" as const;
    if (diff < 3_600_000) return "warning" as const;
    return "primary" as const;
  }, [poll?.expiresAt, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch poll on mount
  useEffect(() => {
    setFetchError(false);
    getPoll(id).catch((error) => {
      setFetchError(true);
      toast.error(error instanceof Error ? error.message : "Unable to load poll");
    });
  }, [getPoll, id]);

  // Real-time socket updates
  const handleSocketUpdate = useCallback((payload: PollUpdatedPayload) => {
    setIsLive(true);
    setLiveResp(payload.totalResponses);
    setLiveQuestions((prev) =>
      prev.map((q) => {
        const qs = payload.analytics.questionSummaries.find((s) => s.questionId === q.id);
        if (!qs) return q;
        return {
          ...q,
          options: q.options.map((o) => {
            const opt = qs.options.find((s) => s.optionId === o.id);
            return opt ? { ...o, votes: opt.votes } : o;
          }),
        };
      }),
    );

    // Refresh data for non-anonymous polls to get updated respondent list
    if (poll && !poll.anonymous) {
      getPoll(id);
    }
  }, [poll, getPoll, id]);

  usePollSocket(id, handleSocketUpdate);

  if (!poll && !fetchError) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="mx-auto h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant mb-4">
          <BarChart3 className="h-6 w-6 text-primary-foreground animate-pulse" />
        </div>
        <p className="text-muted-foreground">Loading poll...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold">Poll not found</h2>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const top = [...(liveQuestions[0]?.options || [])].sort((a, b) => b.votes - a.votes)[0];

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${poll.id}`);
    toast.success("Public link copied");
  };

  const publish = async () => {
    try {
      await publishPoll(poll.id);
      toast.success("Results published publicly");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to publish results");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={
                  poll.status === "active"
                    ? "bg-success/15 text-success border-success/20"
                    : poll.status === "published"
                      ? "bg-primary/15 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground"
                }
              >
                {poll.status}
              </Badge>
              {poll.anonymous && <Badge variant="outline">Anonymous</Badge>}
              {poll.trackIp && (
                <Badge variant="outline" className="bg-warning/15 text-warning border-warning/20 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  IP tracking
                </Badge>
              )}
              {isLive && (
                <Badge className="bg-destructive/15 text-destructive border-destructive/20 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                  </span>
                  LIVE
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">{poll.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{poll.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyLink}>
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            {poll.resultsPublic ? (
              <Button asChild variant="outline">
                <Link to="/r/$id" params={{ id: poll.id }}>
                  <Globe2 className="h-4 w-4 mr-1" /> Public results
                </Link>
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gradient-primary border-0 shadow-elegant">
                    <Trophy className="h-4 w-4 mr-1" /> Publish results
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publish results publicly?</DialogTitle>
                    <DialogDescription>
                      Anyone with the link will be able to see final vote counts and charts. This
                      action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={publish} className="gradient-primary border-0">
                      Publish
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete this poll?</DialogTitle>
                  <DialogDescription>
                    This action can't be undone. All responses will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await deletePoll(poll.id);
                      navigate({ to: "/dashboard" });
                    }}
                  >
                    Delete poll
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total responses"
          value={liveResp.toLocaleString()}
          icon={Users}
          accent="primary"
          trend={isLive ? "Live" : "Loaded"}
        />
        <StatsCard
          label="Time remaining"
          value={timeLeft}
          icon={Clock}
          accent={timeAccent}
          delay={0.05}
        />
        <StatsCard
          label="Top option"
          value={top?.text || "—"}
          icon={Trophy}
          accent="warning"
          delay={0.1}
        />
        <StatsCard
          label="Questions"
          value={liveQuestions.length}
          icon={BarChart3}
          delay={0.15}
        />
      </div>

      {/* Response timeline */}
      {poll.responseHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 shadow-soft border-border/60">
            <div className="mb-4">
              <h3 className="font-semibold">Response timeline</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Responses received per day</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={poll.responseHistory.map((r) => ({
                    day: new Date(r.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    }),
                    responses: r.count,
                  }))}
                  margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
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
                    }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#timelineFill)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Wifi className={`h-3.5 w-3.5 ${isLive ? "text-success" : "text-muted-foreground"}`} />
        {isLive
          ? "Connected — charts update in real time as responses arrive"
          : "Waiting for live connection..."}
      </div>

      {/* Per-question charts */}
      <div className="space-y-4">
        {liveQuestions.map((q, qi) => {
          const data = q.options.map((o) => ({ name: o.text, votes: o.votes }));
          const sum = q.options.reduce((s, o) => s + o.votes, 0) || 1;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.05 }}
            >
              <Card className="p-6 shadow-soft border-border/60">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    Q{qi + 1}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {sum.toLocaleString()} votes
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{q.text}</h3>
                <div className="grid gap-6 lg:grid-cols-2 mt-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--color-border)"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          stroke="var(--color-muted-foreground)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="var(--color-muted-foreground)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
                          {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          dataKey="votes"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
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
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="flex-1 truncate">{o.text}</span>
                        <span className="font-medium tabular-nums">
                          {o.votes.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground tabular-nums w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Voters list — for non-anonymous polls OR when IP tracking is enabled */}
                {q.respondents && q.respondents.length > 0 && (!poll.anonymous || poll.trackIp) && (
                  <Collapsible className="mt-4 border-t pt-4">
                    <CollapsibleTrigger className="flex w-full items-center justify-between group">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <UserCheck className="h-4 w-4" />
                        <span>Voters ({q.respondents.length})</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="space-y-1.5">
                        {q.respondents.map((r) => (
                          <div
                            key={r.userId || r.ipAddress}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                                {r.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{r.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {r.ipAddress ? (
                                    <span className="flex items-center gap-1">
                                      <ShieldAlert className="h-3 w-3 text-warning" />
                                      {r.email || r.ipAddress}
                                    </span>
                                  ) : (
                                    r.email
                                  )}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="ml-2 shrink-0 text-xs bg-primary/5 border-primary/20"
                            >
                              {r.selectedOptionText}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Edit dialog */}
      <EditPollDialog poll={poll} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
