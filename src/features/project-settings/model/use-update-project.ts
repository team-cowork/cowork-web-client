'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchProject } from '@/entities/project/api/patch-project';
import { projectQueries } from '@/entities/project/api/project-queries';
import { type UpdateProjectRequest } from '@/entities/project/model/project';

export function useUpdateProject(teamId: number, projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProjectRequest) =>
      patchProject(projectId, request),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectQueries.detail(projectId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectQueries.byTeam(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectQueries.mine().queryKey,
        }),
      ]),
  });
}
