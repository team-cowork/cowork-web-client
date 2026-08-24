'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchTeamRole } from '@/entities/team/api/patch-team-role';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type UpdateTeamRoleRequest } from '@/entities/team/model/team';

interface UpdateTeamRoleVariables {
  roleId: number;
  request: UpdateTeamRoleRequest;
}

export function useUpdateTeamRole(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, request }: UpdateTeamRoleVariables) =>
      patchTeamRole(teamId, roleId, request),
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
