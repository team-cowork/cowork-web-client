'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { putTeamOwnership } from '@/entities/team/api/put-team-ownership';
import { teamQueries } from '@/entities/team/api/team-queries';

// 소유자 역할 할당은 서버 간 이벤트로 늦게 반영돼서 한 번 더 불러온다
const ROLE_SYNC_RETRY_DELAY = 2000;

export function useTransferTeamOwnership(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: number) =>
      putTeamOwnership(teamId, { targetUserId }),
    onSuccess: () => {
      const invalidateTeam = () =>
        queryClient.invalidateQueries({ queryKey: teamQueries.all() });

      setTimeout(invalidateTeam, ROLE_SYNC_RETRY_DELAY);
      return invalidateTeam();
    },
  });
}
