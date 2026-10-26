import { queryOptions } from '@tanstack/react-query';

import { getVoiceParticipants } from '@/entities/voice/api/get-voice-participants';
import { getVoiceSession } from '@/entities/voice/api/get-voice-session';

export const voiceQueries = {
  all: () => ['voice'] as const,
  participants: (channelId: number) =>
    queryOptions({
      queryKey: [...voiceQueries.all(), 'participants', channelId],
      queryFn: () => getVoiceParticipants(channelId),
      staleTime: 0,
      retry: 1,
      refetchInterval: (query) =>
        query.state.status === 'error' ? false : 15 * 1000,
    }),
  session: (sessionId: string) =>
    queryOptions({
      queryKey: [...voiceQueries.all(), 'session', sessionId],
      queryFn: () => getVoiceSession(sessionId),
      // 통화 시작 시각은 세션이 살아 있는 동안 바뀌지 않는다
      staleTime: Infinity,
    }),
} as const;
