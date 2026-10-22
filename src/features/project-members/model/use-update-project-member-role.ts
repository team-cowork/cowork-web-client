'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchProjectMemberRole } from '@/entities/project/api/patch-project-member-role';
import { projectQueries } from '@/entities/project/api/project-queries';
import {
  type AssignableProjectMemberRole,
  type ProjectMember,
} from '@/entities/project/model/project';

interface RoleChange {
  memberId: number;
  role: AssignableProjectMemberRole;
}

export function useUpdateProjectMemberRole(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: RoleChange) =>
      patchProjectMemberRole(projectId, memberId, role),
    onSuccess: (updated) => {
      queryClient.setQueryData<ProjectMember[]>(
        projectQueries.members(projectId).queryKey,
        (members) =>
          members?.map((member) =>
            member.id === updated.id ? updated : member,
          ),
      );
    },
  });
}
