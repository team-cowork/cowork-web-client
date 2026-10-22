import { queryOptions } from '@tanstack/react-query';

import { getBlockedUsers } from '@/entities/dm/api/get-blocked-users';
import { getDms } from '@/entities/dm/api/get-dms';

export const dmQueries = {
  all: () => ['dm'] as const,
  list: () =>
    queryOptions({
      queryKey: [...dmQueries.all(), 'list'],
      queryFn: getDms,
      // 마지막 메시지·미읽 수가 바뀌어도 서버가 알려주지 않아 주기적으로 다시 받는다.
      refetchInterval: 30 * 1000,
    }),
  blocked: () =>
    queryOptions({
      queryKey: [...dmQueries.all(), 'blocked'],
      queryFn: getBlockedUsers,
    }),
} as const;
