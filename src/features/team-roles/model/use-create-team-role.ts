'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postTeamRole } from '@/entities/team/api/post-team-role';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type CreateTeamRoleRequest } from '@/entities/team/model/team';

export function useCreateTeamRole(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTeamRoleRequest) =>
      postTeamRole(teamId, request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: teamQueries.roles(teamId).queryKey,
      }),
  });
}
