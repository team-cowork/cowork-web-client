'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTeam } from '@/entities/team/api/delete-team';
import { teamQueries } from '@/entities/team/api/team-queries';

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: (_, teamId) => {
      queryClient.removeQueries({
        queryKey: teamQueries.detail(teamId).queryKey,
      });
      return queryClient.invalidateQueries({
        queryKey: teamQueries.list().queryKey,
      });
    },
  });
}
