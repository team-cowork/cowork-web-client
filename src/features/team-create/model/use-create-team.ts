'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postTeam } from '@/entities/team/api/post-team';
import { teamQueries } from '@/entities/team/api/team-queries';

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTeam,
    onSuccess: (team) => {
      queryClient.setQueryData(teamQueries.detail(team.id).queryKey, team);
      return queryClient.invalidateQueries({ queryKey: teamQueries.list().queryKey });
    },
  });
}
