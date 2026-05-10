import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "pp_token";

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

type User = { id?: string; name: string; email: string } | null;

type Ctx = {
  user: User;
  authReady: boolean;
  polls: Poll[];
  loadingPolls: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshPolls: () => Promise<void>;
  addPoll: (p: NewPollInput) => Promise<Poll>;
  updatePoll: (id: string, p: Partial<Poll>) => Promise<Poll>;
  deletePoll: (id: string) => Promise<void>;
  publishPoll: (id: string) => Promise<Poll>;
  getPoll: (id: string) => Promise<Poll>;
  vote: (pollId: string, answers: Record<string, string>) => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

export type NewPollInput = {
  title: string;
  description: string;
  questions: Question[];
  expiresAt: string | null;
  anonymous: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
};

type ApiOption = { _id: string; text: string };
type ApiQuestion = { _id: string; text: string; required: boolean; options: ApiOption[] };
type ApiPoll = {
  _id: string;
  title: string;
  description?: string;
  questions: ApiQuestion[];
  createdAt: string;
  expiresAt?: string | null;
  allowAnonymousResponses: boolean;
  isPublished: boolean;
  resultsPublished: boolean;
};

type ApiAnalytics = {
  totalResponses: number;
  participationRate: number;
  questionSummaries: Array<{
    questionId: string;
    options: Array<{ optionId: string; votes: number }>;
  }>;
};

const StoreCtx = createContext<Ctx | null>(null);

const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !body?.success) {
    throw new Error(body?.message || "Request failed");
  }

  return body.data;
}

const toUser = (user: ApiUser): NonNullable<User> => ({
  id: user._id || user.id,
  name: user.name,
  email: user.email,
});

const buildVoteMap = (analytics?: ApiAnalytics) => {
  const votes = new Map<string, number>();
  analytics?.questionSummaries.forEach((question) => {
    question.options.forEach((option) => {
      votes.set(String(option.optionId), option.votes);
    });
  });
  return votes;
};

const mapPoll = (poll: ApiPoll, analytics?: ApiAnalytics): Poll => {
  const expired = poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false;
  const voteMap = buildVoteMap(analytics);

  return {
    id: poll._id,
    title: poll.title,
    description: poll.description || "",
    createdAt: poll.createdAt,
    expiresAt: poll.expiresAt || null,
    anonymous: poll.allowAnonymousResponses,
    status: expired ? "expired" : poll.resultsPublished || poll.isPublished ? "published" : "active",
    responses: analytics?.totalResponses || 0,
    resultsPublic: poll.resultsPublished,
    questions: poll.questions.map((question) => ({
      id: question._id,
      text: question.text,
      required: question.required,
      options: question.options.map((option) => ({
        id: option._id,
        text: option.text,
        votes: voteMap.get(String(option._id)) || 0,
      })),
    })),
  };
};

const toPollPayload = (poll: NewPollInput | Partial<Poll>) => ({
  title: poll.title,
  description: poll.description,
  expiresAt: poll.expiresAt || null,
  allowAnonymousResponses: "anonymous" in poll ? poll.anonymous : undefined,
  questions: poll.questions?.map((question) => ({
    text: question.text,
    required: question.required,
    options: question.options.map((option) => ({ text: option.text })),
  })),
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [authReady, setAuthReady] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const getAnalytics = useCallback(async (pollId: string) => {
    try {
      const { analytics } = await apiRequest<{ analytics: ApiAnalytics }>(`/responses/analytics/${pollId}`);
      return analytics;
    } catch {
      return undefined;
    }
  }, []);

  const refreshPolls = useCallback(async () => {
    setLoadingPolls(true);
    try {
      const { polls: apiPolls } = await apiRequest<{ polls: ApiPoll[] }>("/polls/my");
      const mapped = await Promise.all(
        apiPolls.map(async (poll) => mapPoll(poll, await getAnalytics(poll._id))),
      );
      setPolls(mapped);
    } finally {
      setLoadingPolls(false);
    }
  }, [getAnalytics]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = (localStorage.getItem("pp_theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    apiRequest<{ user: ApiUser }>("/auth/me")
      .then(({ user }) => {
        setUser(toUser(user));
        return refreshPolls();
      })
      .catch(() => {
        setUser(null);
        setPolls([]);
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setAuthReady(true));
  }, [refreshPolls]);

  const login = async (email: string, password: string) => {
    const { user, token } = await apiRequest<{ user: ApiUser; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, token);
    setUser(toUser(user));
    await refreshPolls();
  };

  const register = async (name: string, email: string, password: string) => {
    const { user, token } = await apiRequest<{ user: ApiUser; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem(TOKEN_KEY, token);
    setUser(toUser(user));
    await refreshPolls();
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setPolls([]);
    }
  };

  const addPoll = async (poll: NewPollInput) => {
    const { poll: created } = await apiRequest<{ poll: ApiPoll }>("/polls", {
      method: "POST",
      body: JSON.stringify(toPollPayload(poll)),
    });
    const mapped = mapPoll(created);
    setPolls((current) => [mapped, ...current]);
    return mapped;
  };

  const updatePoll = async (id: string, patch: Partial<Poll>) => {
    const { poll } = await apiRequest<{ poll: ApiPoll }>(`/polls/${id}`, {
      method: "PUT",
      body: JSON.stringify(toPollPayload(patch)),
    });
    const mapped = mapPoll(poll, await getAnalytics(id));
    setPolls((current) => current.map((item) => (item.id === id ? mapped : item)));
    return mapped;
  };

  const publishPoll = async (id: string) => {
    const { poll } = await apiRequest<{ poll: ApiPoll }>(`/polls/${id}/publish`, { method: "PATCH" });
    const mapped = mapPoll(poll, await getAnalytics(id));
    setPolls((current) => current.map((item) => (item.id === id ? mapped : item)));
    return mapped;
  };

  const deletePoll = async (id: string) => {
    await apiRequest(`/polls/${id}`, { method: "DELETE" });
    setPolls((current) => current.filter((poll) => poll.id !== id));
  };

  const getPoll = useCallback(async (id: string) => {
    const [{ poll }, analytics] = await Promise.all([
      apiRequest<{ poll: ApiPoll; isOwner: boolean }>(`/polls/${id}`),
      getAnalytics(id),
    ]);
    const mapped = mapPoll(poll, analytics);
    setPolls((current) => {
      const exists = current.some((item) => item.id === id);
      return exists ? current.map((item) => (item.id === id ? mapped : item)) : [mapped, ...current];
    });
    return mapped;
  }, [getAnalytics]);

  const vote = useCallback(async (pollId: string, answers: Record<string, string>) => {
    await apiRequest(`/responses/${pollId}`, {
      method: "POST",
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
      }),
    });
    await getPoll(pollId);
  }, [getPoll]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("pp_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <StoreCtx.Provider
      value={{
        user,
        authReady,
        polls,
        loadingPolls,
        login,
        register,
        logout,
        refreshPolls,
        addPoll,
        updatePoll,
        deletePoll,
        publishPoll,
        getPoll,
        vote,
        theme,
        toggleTheme,
      }}
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
