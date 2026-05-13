import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

export type LiveOption = {
  optionId: string;
  text: string;
  votes: number;
  percentage: number;
};

export type LiveQuestion = {
  questionId: string;
  text: string;
  totalAnswered: number;
  options: LiveOption[];
  mostSelected: LiveOption | null;
};

export type LiveAnalytics = {
  totalResponses: number;
  questionSummaries: LiveQuestion[];
};

export type PollUpdatedPayload = {
  pollId: string;
  totalResponses: number;
  analytics: LiveAnalytics;
};

export const usePollSocket = (
  pollId: string | undefined,
  onUpdate: (payload: PollUpdatedPayload) => void,
): void => {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    if (!pollId) return;

    const socket = getSocket();
    const handler = (payload: PollUpdatedPayload) => callbackRef.current(payload);

    socket.emit('join_poll', { pollId });
    socket.on('poll_updated', handler);

    return () => {
      socket.emit('leave_poll', { pollId });
      socket.off('poll_updated', handler);
    };
  }, [pollId]);
};
