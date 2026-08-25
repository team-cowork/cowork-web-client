'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTeamRole } from '@/entities/team/api/delete-team-role';
import { teamQueries } from '@/entities/team/api/team-queries';

export function useDeleteTeamRole(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: number) => deleteTeamRole(teamId, roleId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamQueries.roles(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueries.members(teamId).queryKey,
        }),
      ]),
  });
}
