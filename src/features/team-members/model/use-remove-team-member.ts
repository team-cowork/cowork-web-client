'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTeamMember } from '@/entities/team/api/delete-team-member';
import { teamQueries } from '@/entities/team/api/team-queries';

export function useRemoveTeamMember(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: number) =>
      deleteTeamMember(teamId, targetUserId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamQueries.members(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueries.list().queryKey,
        }),
      ]),
  });
}
