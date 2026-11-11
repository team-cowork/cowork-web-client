'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postProject } from '@/entities/project/api/post-project';
import { projectQueries } from '@/entities/project/api/project-queries';

export function useCreateProject(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postProject,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectQueries.byTeam(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectQueries.mine().queryKey,
        }),
      ]),
  });
}
