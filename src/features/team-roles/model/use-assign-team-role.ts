'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { putTeamMemberRole } from '@/entities/team/api/put-team-member-role';
import { teamQueries } from '@/entities/team/api/team-queries';

interface AssignTeamRoleVariables {
  targetUserId: number;
  roleId: number;
}

export function useAssignTeamRole(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, roleId }: AssignTeamRoleVariables) =>
      putTeamMemberRole(teamId, targetUserId, roleId),
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
