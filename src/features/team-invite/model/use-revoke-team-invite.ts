'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTeamInvite } from '@/entities/team/api/delete-team-invite';
import { teamQueries } from '@/entities/team/api/team-queries';

export function useRevokeTeamInvite(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteCode: string) => deleteTeamInvite(teamId, inviteCode),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: teamQueries.invites(teamId).queryKey,
      }),
  });
}
