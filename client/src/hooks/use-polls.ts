import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type PollOption = { _id: string; text: string; votes?: number };
export type Question = {
  _id: string;
  text: string;
  required: boolean;
  options: PollOption[];
};
export type Poll = {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  expiresAt: string | null;
  allowAnonymousResponses: boolean;
  status: "draft" | "active" | "expired" | "published";
  responses: number;
  resultsPublished: boolean;
};

type PollPayload = Pick<
  Poll,
  "title" | "description" | "questions" | "expiresAt" | "allowAnonymousResponses"
>;

export function useMyPolls() {
  return useQuery({
    queryKey: ["polls", "my"],
    queryFn: () => apiRequest<{ polls: Poll[] }>("/polls/my").then((d) => d.polls),
  });
}

export function usePoll(id: string) {
  return useQuery({
    queryKey: ["polls", id],
    queryFn: () => apiRequest<{ poll: Poll }>(`/polls/${id}`).then((d) => d.poll),
    enabled: !!id,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PollPayload) =>
      apiRequest<{ poll: Poll }>("/polls", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/polls/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

export function usePublishResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/polls/${id}/publish`, { method: "PATCH" }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["polls", id] });
      queryClient.invalidateQueries({ queryKey: ["polls", "my"] });
    },
  });
}
