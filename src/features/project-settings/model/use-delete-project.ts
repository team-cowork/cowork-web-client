'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProject } from '@/entities/project/api/delete-project';
import { projectQueries } from '@/entities/project/api/project-queries';
import { teamPath } from '@/shared/model/paths';

/** 삭제하면 팀 홈으로 나간다. */
export function useDeleteProject(teamId: number, projectId: number) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      router.push(teamPath(teamId));
      queryClient.removeQueries({
        queryKey: projectQueries.detail(projectId).queryKey,
      });
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectQueries.byTeam(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectQueries.mine().queryKey,
        }),
      ]);
    },
  });
}
