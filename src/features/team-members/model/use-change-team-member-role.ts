'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchTeamMemberRole } from '@/entities/team/api/patch-team-member-role';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type AssignableTeamMemberRole } from '@/entities/team/model/team';

interface ChangeTeamMemberRoleVariables {
  targetUserId: number;
  role: AssignableTeamMemberRole;
}

export function useChangeTeamMemberRole(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, role }: ChangeTeamMemberRoleVariables) =>
      patchTeamMemberRole(teamId, targetUserId, { role }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: teamQueries.members(teamId).queryKey,
      }),
  });
}
