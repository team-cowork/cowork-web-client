import { queryOptions } from '@tanstack/react-query';

import { getTeam } from '@/entities/team/api/get-team';
import { getTeams } from '@/entities/team/api/get-teams';

export const teamQueries = {
  all: () => ['team'] as const,
  list: () =>
    queryOptions({
      queryKey: [...teamQueries.all(), 'list'],
      queryFn: getTeams,
    }),
  detail: (teamId: number) =>
    queryOptions({
      queryKey: [...teamQueries.all(), 'detail', teamId],
      queryFn: () => getTeam(teamId),
    }),
} as const;
