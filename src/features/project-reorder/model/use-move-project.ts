'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { patchTeamProjectsOrder } from '@/entities/project/api/patch-team-projects-order';
import { projectQueries } from '@/entities/project/api/project-queries';
import { type Project } from '@/entities/project/model/project';

export type ProjectMoveDirection = 'up' | 'down';

function moveProject(
  projects: Project[],
  projectId: number,
  direction: ProjectMoveDirection,
): Project[] | null {
  const from = projects.findIndex((project) => project.id === projectId);
  const to = direction === 'up' ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= projects.length) return null;

  const next = [...projects];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved!);
  return next;
}

/** 팀 프로젝트 순서를 한 칸씩 옮긴다. 화면을 먼저 바꾸고 실패하면 되돌린다. */
export function useMoveProject(teamId: number) {
  const queryClient = useQueryClient();
  const queryKey = projectQueries.byTeam(teamId).queryKey;
  const { data: projects = [] } = useQuery(projectQueries.byTeam(teamId));

  const mutation = useMutation({
    mutationFn: (ordered: Project[]) =>
      patchTeamProjectsOrder(
        teamId,
        ordered.map((project) => project.id),
      ),
    onMutate: (ordered) => {
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, ordered);
      return { previous };
    },
    onError: (_error, _ordered, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },
    onSuccess: (ordered) => queryClient.setQueryData(queryKey, ordered),
  });

  const canMove = (projectId: number, direction: ProjectMoveDirection) =>
    moveProject(projects, projectId, direction) !== null;

  const move = (projectId: number, direction: ProjectMoveDirection) => {
    const ordered = moveProject(projects, projectId, direction);
    if (ordered) mutation.mutate(ordered);
  };

  return { move, canMove, isPending: mutation.isPending };
}
