import { queryOptions } from '@tanstack/react-query';

import { getDms } from '@/entities/dm/api/get-dms';

export const dmQueries = {
  all: () => ['dm'] as const,
  list: () =>
    queryOptions({
      queryKey: [...dmQueries.all(), 'list'],
      queryFn: getDms,
    }),
} as const;
