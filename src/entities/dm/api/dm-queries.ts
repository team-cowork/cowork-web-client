import { queryOptions } from '@tanstack/react-query';

import { getBlockedUsers } from '@/entities/dm/api/get-blocked-users';
import { getDms } from '@/entities/dm/api/get-dms';

export const dmQueries = {
  all: () => ['dm'] as const,
  list: () =>
    queryOptions({
      queryKey: [...dmQueries.all(), 'list'],
      queryFn: getDms,
      // 목록에 없던 새 대화는 서버가 알려주지 않아 주기적으로 다시 받는다.
      // 이미 있는 대화의 새 메시지는 `useDmListEvents`가 바로 반영한다.
      refetchInterval: 30 * 1000,
    }),
  blocked: () =>
    queryOptions({
      queryKey: [...dmQueries.all(), 'blocked'],
      queryFn: getBlockedUsers,
    }),
} as const;
