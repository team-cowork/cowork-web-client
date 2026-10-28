import { queryOptions } from '@tanstack/react-query';

import { getLiveStatus } from '@/entities/live/api/get-live-status';

export const liveQueries = {
  all: () => ['live'] as const,
  status: (channelId: number) =>
    queryOptions({
      queryKey: [...liveQueries.all(), 'status', channelId],
      queryFn: () => getLiveStatus(channelId),
      staleTime: 0,
      retry: 1,
      refetchInterval: (query) =>
        query.state.status === 'error' ? false : 15 * 1000,
    }),
} as const;
