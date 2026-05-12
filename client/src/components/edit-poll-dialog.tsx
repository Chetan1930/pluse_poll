import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type Poll, type Question, useStore } from "@/lib/api-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowDown, ArrowUp, GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const uid = () => Math.random().toString(36).slice(2, 9);

interface EditPollDialogProps {
  poll: Poll;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPollDialog({ poll, open, onOpenChange }: EditPollDialogProps) {
  const { updatePoll } = useStore();
  const [title, setTitle] = useState(poll.title);
  const [desc, setDesc] = useState(poll.description);
  const [anonymous, setAnonymous] = useState(poll.anonymous);
  const [expiresAt, setExpiresAt] = useState(
    poll.expiresAt ? new Date(poll.expiresAt).toISOString().slice(0, 16) : "",
  );
  const [questions, setQuestions] = useState<Question[]>(poll.questions);
  const [saving, setSaving] = useState(false);

  const updateQ = (id: string, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const addOption = (qid: string) => {
    const q = questions.find((x) => x.id === qid);
    if (!q) return;
    updateQ(qid, { options: [...q.options, { id: uid(), text: "", votes: 0 }] });
  };

  const removeOption = (qid: string, oid: string) => {
    const q = questions.find((x) => x.id === qid);
    if (!q || q.options.length <= 2) return;
    updateQ(qid, { options: q.options.filter((o) => o.id !== oid) });
  };

  const move = (i: number, dir: -1 | 1) => {
    setQuestions((qs) => {
      const next = [...qs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return qs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const validate = () => {
    if (!title.trim()) return "Poll title is required";
    for (const q of questions) {
      if (!q.text.trim()) return "All questions must have text";
      if (q.options.length < 2) return "Each question needs at least 2 options";
      if (q.options.some((o) => !o.text.trim())) return "All options must have text";
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);
    try {
      await updatePoll(poll.id, {
        title: title.trim(),
        description: desc.trim(),
        questions,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        anonymous,
      });
      toast.success("Poll updated!");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update poll");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit poll</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="mt-1.5"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">Anonymous responses</p>
                <p className="text-xs text-muted-foreground">No login required to respond</p>
              </div>
              <Switch checked={anonymous} onCheckedChange={setAnonymous} />
            </div>
            <div>
              <Label>Expires at</Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty for no expiry.</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Questions</p>
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
                  <Card className="p-4 border-border/60">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col items-center gap-1 pt-1.5">
                        <button
                          onClick={() => move(idx, -1)}
                          className="p-0.5 rounded hover:bg-muted text-muted-foreground"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        <button
                          onClick={() => move(idx, 1)}
                          className="p-0.5 rounded hover:bg-muted text-muted-foreground"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Q{idx + 1}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Required</span>
                            <Switch
                              checked={q.required}
                              onCheckedChange={(v) => updateQ(q.id, { required: v })}
                            />
                            {questions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() =>
                                  setQuestions((qs) => qs.filter((x) => x.id !== q.id))
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <Input
                          value={q.text}
                          onChange={(e) => updateQ(q.id, { text: e.target.value })}
                          placeholder="Question text..."
                          className="text-sm"
                        />
                        <div className="space-y-1.5">
                          {q.options.map((o) => (
                            <div key={o.id} className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                              <Input
                                value={o.text}
                                onChange={(e) =>
                                  updateQ(q.id, {
                                    options: q.options.map((x) =>
                                      x.id === o.id ? { ...x, text: e.target.value } : x,
                                    ),
                                  })
                                }
                                placeholder="Option..."
                                className="h-8 text-sm"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground"
                                onClick={() => removeOption(q.id, o.id)}
                                disabled={q.options.length <= 2}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addOption(q.id)}
                          className="h-7 text-xs text-primary hover:text-primary"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add option
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setQuestions([
                  ...questions,
                  {
                    id: uid(),
                    text: "",
                    required: true,
                    options: [
                      { id: uid(), text: "", votes: 0 },
                      { id: uid(), text: "", votes: 0 },
                    ],
                  },
                ])
              }
              className="w-full border-dashed"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add question
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gradient-primary border-0 shadow-elegant"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
