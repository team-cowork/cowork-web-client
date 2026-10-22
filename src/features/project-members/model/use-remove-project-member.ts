'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProjectMember } from '@/entities/project/api/delete-project-member';
import { projectQueries } from '@/entities/project/api/project-queries';

export function useRemoveProjectMember(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => deleteProjectMember(projectId, memberId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectQueries.members(projectId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectQueries.detail(projectId).queryKey,
        }),
      ]),
  });
}
