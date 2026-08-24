import { queryOptions } from '@tanstack/react-query';

import { getVoiceParticipants } from '@/entities/voice/api/get-voice-participants';

export const voiceQueries = {
  all: () => ['voice'] as const,
  participants: (channelId: number) =>
    queryOptions({
      queryKey: [...voiceQueries.all(), 'participants', channelId],
      queryFn: () => getVoiceParticipants(channelId),
      staleTime: 0,
      retry: 1,
      refetchInterval: (query) => (query.state.status === 'error' ? false : 15 * 1000),
    }),
} as const;
