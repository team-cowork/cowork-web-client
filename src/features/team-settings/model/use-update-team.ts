'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchTeam } from '@/entities/team/api/patch-team';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type UpdateTeamRequest } from '@/entities/team/model/team';

export function useUpdateTeam(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateTeamRequest) => patchTeam(teamId, request),
    onSuccess: (team) => {
      queryClient.setQueryData(teamQueries.detail(team.id).queryKey, team);
      return queryClient.invalidateQueries({
        queryKey: teamQueries.list().queryKey,
      });
    },
  });
}
