import { queryOptions } from '@tanstack/react-query';

import { getMe } from '@/entities/user/api/get-me';
import { getUser } from '@/entities/user/api/get-user';

export const userQueries = {
  me: () =>
    queryOptions({
      queryKey: ['user', 'me'],
      queryFn: getMe,
      staleTime: Infinity,
    }),
  detail: (userId: number) =>
    queryOptions({
      queryKey: ['user', 'detail', userId],
      queryFn: () => getUser(userId),
      staleTime: 5 * 60 * 1000,
    }),
} as const;
