import { queryOptions } from '@tanstack/react-query';

import { getWebhooks } from '@/entities/webhook/api/get-webhooks';

export const webhookQueries = {
  all: () => ['webhook'] as const,
  list: (channelId: number) =>
    queryOptions({
      queryKey: [...webhookQueries.all(), 'list', channelId],
      queryFn: () => getWebhooks(channelId),
    }),
} as const;
