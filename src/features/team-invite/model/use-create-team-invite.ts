'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postTeamInvite } from '@/entities/team/api/post-team-invite';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type InviteDuration } from '@/entities/team/model/team';

export function useCreateTeamInvite(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (duration: InviteDuration) =>
      postTeamInvite(teamId, { duration }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: teamQueries.invites(teamId).queryKey,
      }),
  });
}
