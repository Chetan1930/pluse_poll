import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useStore, type Question } from "@/lib/api-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Trash2,
  X,
  Eye,
  Calendar,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/create")({
  head: () => ({
    meta: [
      { title: "Create poll — PulsePoll" },
      { name: "description", content: "Build a new poll" },
    ],
  }),
  component: CreatePoll,
});

const uid = () => Math.random().toString(36).slice(2, 9);

function emptyQuestion(): Question {
  return {
    id: uid(),
    text: "",
    required: true,
    options: [
      { id: uid(), text: "", votes: 0 },
      { id: uid(), text: "", votes: 0 },
    ],
  };
}

function CreatePoll() {
  const { addPoll } = useStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);

  const updateQ = (id: string, patch: Partial<Question>) =>
    setQuestions((q) => q.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const addOption = (qid: string) =>
    updateQ(qid, {
      options: [
        ...(questions.find((q) => q.id === qid)?.options || []),
        { id: uid(), text: "", votes: 0 },
      ],
    });
  const removeOption = (qid: string, oid: string) => {
    const q = questions.find((x) => x.id === qid)!;
    if (q.options.length <= 2) return;
    updateQ(qid, { options: q.options.filter((o) => o.id !== oid) });
  };
  const move = (i: number, dir: -1 | 1) => {
    setQuestions((q) => {
      const next = [...q];
      const j = i + dir;
      if (j < 0 || j >= next.length) return q;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const validate = () => {
    if (!title.trim()) return "Add a poll title";
    for (const q of questions) {
      if (!q.text.trim()) return "All questions need text";
      if (q.options.length < 2) return "Each question needs ≥ 2 options";
      if (q.options.some((o) => !o.text.trim())) return "All options need text";
    }
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) return toast.error(err);
    try {
      const poll = await addPoll({
        title: title.trim(),
        description: desc.trim(),
        questions,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        anonymous,
      });
      toast.success("Poll created!");
      navigate({ to: "/dashboard/polls/$id", params: { id: poll.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create poll");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create a new poll</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Type, click, ship. Your poll goes live instantly.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Cancel
          </Button>
          <Button onClick={submit} className="gradient-primary border-0 shadow-elegant">
            <Save className="h-4 w-4 mr-1" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <Card className="p-6 shadow-soft border-border/60 space-y-4">
            <div>
              <Label>Poll title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your favorite framework?"
                className="mt-1.5 text-lg font-medium h-12"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="A short description for your respondents."
                className="mt-1.5"
                rows={2}
              />
            </div>
          </Card>

          <AnimatePresence>
            {questions.map((q, idx) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-6 shadow-soft border-border/60">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 pt-2">
                      <button
                        onClick={() => move(idx, -1)}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <button
                        onClick={() => move(idx, 1)}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Question {idx + 1}
                        </Badge>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            Required
                            <Switch
                              checked={q.required}
                              onCheckedChange={(v) => updateQ(q.id, { required: v })}
                            />
                          </div>
                          {questions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Input
                        value={q.text}
                        onChange={(e) => updateQ(q.id, { text: e.target.value })}
                        placeholder="Type your question…"
                        className="text-base font-medium"
                      />
                      <div className="space-y-2">
                        {q.options.map((o, oi) => (
                          <div key={o.id} className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full border-2 border-border shrink-0" />
                            <Input
                              value={o.text}
                              onChange={(e) =>
                                updateQ(q.id, {
                                  options: q.options.map((x) =>
                                    x.id === o.id ? { ...x, text: e.target.value } : x,
                                  ),
                                })
                              }
                              placeholder={`Option ${oi + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={() => removeOption(q.id, o.id)}
                              disabled={q.options.length <= 2}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(q.id)}
                        className="text-primary hover:text-primary"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add option
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button
            variant="outline"
            onClick={() => setQuestions([...questions, emptyQuestion()])}
            className="w-full border-dashed h-12"
          >
            <Plus className="h-4 w-4 mr-1" /> Add question
          </Button>
        </div>

        <div className="space-y-4">
          <Card className="p-6 shadow-soft border-border/60 space-y-4 sticky top-24">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" /> Settings
            </h3>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">Anonymous responses</p>
                <p className="text-xs text-muted-foreground">No login required</p>
              </div>
              <Switch checked={anonymous} onCheckedChange={setAnonymous} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Expires at
              </Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty for no expiry.</p>
            </div>
          </Card>

          <Card className="p-6 shadow-soft border-border/60">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Live preview</p>
            <h3 className="mt-2 font-semibold text-lg">{title || "Your poll title"}</h3>
            <p className="text-sm text-muted-foreground">
              {desc || "Description will appear here."}
            </p>
            <div className="mt-4 space-y-3">
              {questions.map((q, i) => (
                <div key={q.id} className="rounded-xl border border-border/60 p-3">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.text || "Question…"}{" "}
                    {q.required && <span className="text-destructive">*</span>}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {q.options.map((o) => (
                      <div
                        key={o.id}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                      >
                        <span className="h-3 w-3 rounded-full border" /> {o.text || "Option…"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
