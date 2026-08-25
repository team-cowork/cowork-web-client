'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postTeamMembers } from '@/entities/team/api/post-team-members';
import { teamQueries } from '@/entities/team/api/team-queries';

export function useInviteTeamMembers(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: number[]) => postTeamMembers(teamId, { userIds }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: teamQueries.members(teamId).queryKey,
      }),
  });
}
