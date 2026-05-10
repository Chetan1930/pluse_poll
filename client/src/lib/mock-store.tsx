import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PollOption = { id: string; text: string; votes: number };
export type Question = {
  id: string;
  text: string;
  required: boolean;
  options: PollOption[];
};
export type Poll = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  expiresAt: string | null;
  anonymous: boolean;
  status: "draft" | "active" | "expired" | "published";
  responses: number;
  resultsPublic: boolean;
};

type User = { name: string; email: string } | null;

type Ctx = {
  user: User;
  login: (email: string, name?: string) => void;
  logout: () => void;
  polls: Poll[];
  addPoll: (p: Poll) => void;
  updatePoll: (id: string, p: Partial<Poll>) => void;
  deletePoll: (id: string) => void;
  vote: (pollId: string, answers: Record<string, string>) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

const seedPolls = (): Poll[] => [
  {
    id: "demo-1",
    title: "What's your favorite frontend framework in 2026?",
    description: "Help us understand the developer landscape this year.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 4).toISOString(),
    anonymous: true,
    status: "active",
    responses: 1248,
    resultsPublic: true,
    questions: [
      {
        id: "q1",
        text: "Which framework do you reach for first?",
        required: true,
        options: [
          { id: "o1", text: "React", votes: 612 },
          { id: "o2", text: "Vue", votes: 218 },
          { id: "o3", text: "Svelte", votes: 244 },
          { id: "o4", text: "Solid", votes: 174 },
        ],
      },
      {
        id: "q2",
        text: "Preferred styling approach?",
        required: false,
        options: [
          { id: "o1", text: "Tailwind CSS", votes: 780 },
          { id: "o2", text: "CSS Modules", votes: 192 },
          { id: "o3", text: "CSS-in-JS", votes: 156 },
          { id: "o4", text: "Vanilla CSS", votes: 120 },
        ],
      },
    ],
  },
  {
    id: "demo-2",
    title: "Team retro: how was this sprint?",
    description: "Quick pulse check before Friday's retro.",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
    anonymous: false,
    status: "expired",
    responses: 24,
    resultsPublic: false,
    questions: [
      {
        id: "q1",
        text: "Overall sprint feeling?",
        required: true,
        options: [
          { id: "o1", text: "🚀 Crushed it", votes: 10 },
          { id: "o2", text: "🙂 Solid", votes: 9 },
          { id: "o3", text: "😐 Meh", votes: 4 },
          { id: "o4", text: "😩 Rough", votes: 1 },
        ],
      },
    ],
  },
  {
    id: "demo-3",
    title: "Pick our next product feature",
    description: "Vote on what we should ship next quarter.",
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    expiresAt: null,
    anonymous: true,
    status: "published",
    responses: 3412,
    resultsPublic: true,
    questions: [
      {
        id: "q1",
        text: "Which feature excites you most?",
        required: true,
        options: [
          { id: "o1", text: "AI Insights", votes: 1422 },
          { id: "o2", text: "Embeddable widgets", votes: 980 },
          { id: "o3", text: "Slack integration", votes: 612 },
          { id: "o4", text: "Custom branding", votes: 398 },
        ],
      },
    ],
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = localStorage.getItem("pp_user");
    if (u) setUser(JSON.parse(u));
    const p = localStorage.getItem("pp_polls");
    setPolls(p ? JSON.parse(p) : seedPolls());
    const t = (localStorage.getItem("pp_theme") as "light" | "dark") || "light";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (polls.length) localStorage.setItem("pp_polls", JSON.stringify(polls));
  }, [polls]);

  const login = (email: string, name?: string) => {
    const u = { email, name: name || email.split("@")[0] };
    setUser(u);
    localStorage.setItem("pp_user", JSON.stringify(u));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("pp_user");
  };
  const addPoll = (p: Poll) => setPolls((cur) => [p, ...cur]);
  const updatePoll = (id: string, patch: Partial<Poll>) =>
    setPolls((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const deletePoll = (id: string) => setPolls((cur) => cur.filter((p) => p.id !== id));
  const vote = (pollId: string, answers: Record<string, string>) =>
    setPolls((cur) =>
      cur.map((p) => {
        if (p.id !== pollId) return p;
        const questions = p.questions.map((q) => {
          const optId = answers[q.id];
          if (!optId) return q;
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optId ? { ...o, votes: o.votes + 1 } : o,
            ),
          };
        });
        return { ...p, questions, responses: p.responses + 1 };
      }),
    );
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("pp_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <StoreCtx.Provider
      value={{ user, login, logout, polls, addPoll, updatePoll, deletePoll, vote, theme, toggleTheme }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
