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
      // 상세 화면이 아직 떠 있어 상세 캐시를 지우면 삭제된 프로젝트를 다시 조회한다.
      // 화면을 벗어나면 캐시는 알아서 정리된다.
      router.push(teamPath(teamId));
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
