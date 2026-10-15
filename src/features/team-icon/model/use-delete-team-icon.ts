'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTeamIcon } from '@/entities/team/api/delete-team-icon';
import { teamQueries } from '@/entities/team/api/team-queries';

export function useDeleteTeamIcon(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTeamIcon(teamId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamQueries.detail(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueries.list().queryKey,
        }),
      ]),
  });
}
