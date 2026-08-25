import { queryOptions } from '@tanstack/react-query';

import { getTeam } from '@/entities/team/api/get-team';
import { getTeamInvites } from '@/entities/team/api/get-team-invites';
import { getTeamMemberRoles } from '@/entities/team/api/get-team-member-roles';
import { getTeamMembers } from '@/entities/team/api/get-team-members';
import { getTeamRoles } from '@/entities/team/api/get-team-roles';
import { getTeams } from '@/entities/team/api/get-teams';

export const teamQueries = {
  all: () => ['team'] as const,
  list: () =>
    queryOptions({
      queryKey: [...teamQueries.all(), 'list'],
      queryFn: getTeams,
    }),
  detail: (teamId: number) =>
    queryOptions({
      queryKey: [...teamQueries.all(), 'detail', teamId],
      queryFn: () => getTeam(teamId),
    }),
  members: (teamId: number) =>
    queryOptions({
      queryKey: [...teamQueries.all(), 'members', teamId],
      queryFn: () => getTeamMembers(teamId),
    }),
  memberRoles: (teamId: number, userId: number) =>
    queryOptions({
      queryKey: [...teamQueries.all(), 'memberRoles', teamId, userId],
      queryFn: () => getTeamMemberRoles(teamId, userId),
    }),
  roles: (teamId: number) =>
    queryOptions({
      queryKey: [...teamQueries.all(), 'roles', teamId],
      queryFn: () => getTeamRoles(teamId),
    }),
  invites: (teamId: number) =>
    queryOptions({
      queryKey: [...teamQueries.all(), 'invites', teamId],
      queryFn: () => getTeamInvites(teamId),
    }),
} as const;
