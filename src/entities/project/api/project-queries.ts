import { queryOptions } from '@tanstack/react-query';

import { getMyProjects } from '@/entities/project/api/get-my-projects';
import { getProject } from '@/entities/project/api/get-project';
import { getProjectChannels } from '@/entities/project/api/get-project-channels';
import { getProjectMembers } from '@/entities/project/api/get-project-members';
import { getTeamProjects } from '@/entities/project/api/get-team-projects';

export const projectQueries = {
  all: () => ['project'] as const,
  byTeam: (teamId: number) =>
    queryOptions({
      queryKey: [...projectQueries.all(), 'byTeam', teamId],
      queryFn: () => getTeamProjects(teamId),
    }),
  mine: () =>
    queryOptions({
      queryKey: [...projectQueries.all(), 'mine'],
      queryFn: getMyProjects,
    }),
  detail: (projectId: number) =>
    queryOptions({
      queryKey: [...projectQueries.all(), 'detail', projectId],
      queryFn: () => getProject(projectId),
    }),
  members: (projectId: number) =>
    queryOptions({
      queryKey: [...projectQueries.all(), 'members', projectId],
      queryFn: () => getProjectMembers(projectId),
    }),
  channels: (projectId: number) =>
    queryOptions({
      queryKey: [...projectQueries.all(), 'channels', projectId],
      queryFn: () => getProjectChannels(projectId),
    }),
} as const;
