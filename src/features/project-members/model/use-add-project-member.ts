'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postProjectMember } from '@/entities/project/api/post-project-member';
import { projectQueries } from '@/entities/project/api/project-queries';
import { type AddProjectMemberRequest } from '@/entities/project/model/project';

export function useAddProjectMember(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddProjectMemberRequest) =>
      postProjectMember(projectId, request),
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
