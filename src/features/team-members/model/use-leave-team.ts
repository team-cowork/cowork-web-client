'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTeamMember } from '@/entities/team/api/delete-team-member';
import { teamQueries } from '@/entities/team/api/team-queries';

export function useLeaveTeam(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (myUserId: number) => deleteTeamMember(teamId, myUserId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: teamQueries.detail(teamId).queryKey,
      });
      return queryClient.invalidateQueries({
        queryKey: teamQueries.list().queryKey,
      });
    },
  });
}
