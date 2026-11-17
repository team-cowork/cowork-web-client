import { queryOptions } from '@tanstack/react-query';

import { getMe } from '@/entities/user/api/get-me';
import { getUser } from '@/entities/user/api/get-user';
import { getUsers } from '@/entities/user/api/get-users';
import { type SearchUsersParams } from '@/entities/user/model/user';

export const userQueries = {
  all: () => ['user'] as const,
  me: () =>
    queryOptions({
      queryKey: [...userQueries.all(), 'me'],
      queryFn: getMe,
      // 프로필 이미지 주소는 15분 뒤 만료되는 서명 주소라, 그보다 먼저 다시 받아 새 주소로 바꾼다.
      staleTime: 10 * 60 * 1000,
    }),
  search: (params: SearchUsersParams = {}) =>
    queryOptions({
      queryKey: [...userQueries.all(), 'search', params],
      queryFn: () => getUsers(params),
      staleTime: 5 * 60 * 1000,
    }),
  detail: (userId: number) =>
    queryOptions({
      queryKey: [...userQueries.all(), 'detail', userId],
      queryFn: () => getUser(userId),
      staleTime: 5 * 60 * 1000,
    }),
} as const;
