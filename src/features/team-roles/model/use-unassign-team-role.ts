'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTeamMemberRole } from '@/entities/team/api/delete-team-member-role';
import { teamQueries } from '@/entities/team/api/team-queries';

interface UnassignTeamRoleVariables {
  targetUserId: number;
  roleId: number;
}

export function useUnassignTeamRole(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, roleId }: UnassignTeamRoleVariables) =>
      deleteTeamMemberRole(teamId, targetUserId, roleId),
    onSuccess: (_, { targetUserId }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamQueries.members(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueries.memberRoles(teamId, targetUserId).queryKey,
        }),
      ]),
  });
}
