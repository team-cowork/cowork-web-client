import { queryOptions } from '@tanstack/react-query';

import { getMe } from '@/entities/user/api/get-me';

export const userQueries = {
  me: () =>
    queryOptions({
      queryKey: ['user', 'me'],
      queryFn: getMe,
      staleTime: Infinity,
    }),
} as const;
