'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postTeamJoin } from '@/entities/team/api/post-team-join';
import { teamQueries } from '@/entities/team/api/team-queries';

export function useJoinTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTeamJoin,
    onSuccess: ({ teamId }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamQueries.list().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueries.members(teamId).queryKey,
        }),
      ]),
  });
}
