'use client';

import { useState } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import { useAssignTeamRole } from '@/features/team-roles/model/use-assign-team-role';
import { useUnassignTeamRole } from '@/features/team-roles/model/use-unassign-team-role';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type TeamRole } from '@/entities/team/model/team';
import { userQueries } from '@/entities/user/api/user-queries';
import {
  matchesUserKeyword,
  userDisplayName,
} from '@/entities/user/lib/user-display';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { EmptyState } from '@/shared/ui/empty-state';
import { UsersIcon } from '@/shared/ui/icons/users-icon';
import { TextField } from '@/shared/ui/text-field';

export interface TeamRoleMembersTabProps {
  teamId: number;
  role: TeamRole;
}

export function TeamRoleMembersTab({ teamId, role }: TeamRoleMembersTabProps) {
  const [keyword, setKeyword] = useState('');
  const { data: members = [] } = useQuery(teamQueries.members(teamId));
  const userResults = useQueries({
    queries: members.map((member) => userQueries.detail(member.userId)),
  });
  const usersByUserId = new Map(
    members.map((member, index) => [member.userId, userResults[index]?.data]),
  );

  const assignRole = useAssignTeamRole(teamId);
  const unassignRole = useUnassignTeamRole(teamId);

  const holderIds = new Set(
    members
      .filter((member) => member.roles.some((r) => r.id === role.id))
      .map((member) => member.userId),
  );

  const visibleMembers = members.filter((member) =>
    matchesUserKeyword(
      member.userId,
      usersByUserId.get(member.userId),
      keyword,
    ),
  );

  return (
    <div className="flex flex-col gap-3.5">
      <TextField
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="이름으로 검색해서 역할 부여"
      />

      {visibleMembers.length === 0 ? (
        <EmptyState icon={<UsersIcon />} title="검색 결과가 없습니다" />
      ) : (
        <ul className="flex flex-col gap-1">
          {visibleMembers.map((member) => {
            const user = usersByUserId.get(member.userId);
            const name = userDisplayName(member.userId, user);
            const hasRole = holderIds.has(member.userId);

            return (
              <li key={member.id}>
                <div className="flex h-13 items-center gap-2.5 rounded-xl px-3 hover:bg-surface-container">
                  <UserAvatar user={user} size={32} />
                  <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
                    {name}
                  </span>
                  {hasRole ? (
                    <button
                      type="button"
                      aria-label={`${name} 역할 회수`}
                      disabled={unassignRole.isPending}
                      onClick={() =>
                        unassignRole.mutate({
                          targetUserId: member.userId,
                          roleId: role.id,
                        })
                      }
                      className="shrink-0 cursor-pointer typography-subtext-small text-on-surface-variant hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      회수
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`${name} 역할 부여`}
                      disabled={assignRole.isPending}
                      onClick={() =>
                        assignRole.mutate({
                          targetUserId: member.userId,
                          roleId: role.id,
                        })
                      }
                      className="shrink-0 cursor-pointer typography-subtext-small text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      부여
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
