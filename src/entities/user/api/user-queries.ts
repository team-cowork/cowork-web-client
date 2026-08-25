import { queryOptions } from '@tanstack/react-query';

import { getMe } from '@/entities/user/api/get-me';
import { getUser } from '@/entities/user/api/get-user';
import { getUsers } from '@/entities/user/api/get-users';
import { type SearchUsersParams } from '@/entities/user/model/user';

export const userQueries = {
  me: () =>
    queryOptions({
      queryKey: ['user', 'me'],
      queryFn: getMe,
      staleTime: Infinity,
    }),
  search: (params: SearchUsersParams = {}) =>
    queryOptions({
      queryKey: ['user', 'search', params],
      queryFn: () => getUsers(params),
      staleTime: 5 * 60 * 1000,
    }),
  detail: (userId: number) =>
    queryOptions({
      queryKey: ['user', 'detail', userId],
      queryFn: () => getUser(userId),
      staleTime: 5 * 60 * 1000,
    }),
} as const;
