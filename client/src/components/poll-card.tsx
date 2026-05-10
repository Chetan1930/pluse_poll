import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Users, MoreVertical, Share2, BarChart3, Trash2, Eye } from "lucide-react";
import type { Poll } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const statusStyles: Record<Poll["status"], string> = {
  active: "bg-success/15 text-success border-success/20",
  expired: "bg-muted text-muted-foreground border-border",
  published: "bg-primary/15 text-primary border-primary/20",
  draft: "bg-warning/15 text-warning border-warning/20",
};

export function PollCard({ poll, onDelete }: { poll: Poll; onDelete?: (id: string) => void }) {
  const copyLink = () => {
    const url = `${window.location.origin}/p/${poll.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="p-5 shadow-soft border-border/60 hover:shadow-elegant transition-shadow group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={statusStyles[poll.status]}>
                {poll.status}
              </Badge>
              {poll.anonymous && (
                <Badge variant="outline" className="text-xs">Anonymous</Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-snug truncate">{poll.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{poll.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/p/$id" params={{ id: poll.id }}><Eye className="h-4 w-4 mr-2" />View poll</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/polls/$id" params={{ id: poll.id }}><BarChart3 className="h-4 w-4 mr-2" />Analytics</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}><Share2 className="h-4 w-4 mr-2" />Copy link</DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(poll.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {poll.responses.toLocaleString()}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
            </span>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
            <Link to="/dashboard/polls/$id" params={{ id: poll.id }}>View →</Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
