'use client';

import { useRef, useState } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import { useAssignTeamRole } from '@/features/team-roles/model/use-assign-team-role';
import { useUnassignTeamRole } from '@/features/team-roles/model/use-unassign-team-role';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type TeamMember, type TeamRole } from '@/entities/team/model/team';
import { userQueries } from '@/entities/user/api/user-queries';
import { type User } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { UsersIcon } from '@/shared/ui/icons/users-icon';
import { TextField } from '@/shared/ui/text-field';

function memberDisplayName(member: TeamMember, user: User | undefined): string {
  if (user) return user.nickname ?? user.name;
  return `사용자 #${member.userId}`;
}

export interface TeamRoleMembersTabProps {
  teamId: number;
  role: TeamRole;
}

export function TeamRoleMembersTab({ teamId, role }: TeamRoleMembersTabProps) {
  const inputRef = useRef<HTMLInputElement>(null);
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

  const trimmedKeyword = keyword.trim().toLowerCase();
  const isSearching = trimmedKeyword.length > 0;

  const candidates = isSearching
    ? members.filter((member) => {
        if (holderIds.has(member.userId)) return false;
        const user = usersByUserId.get(member.userId);
        return memberDisplayName(member, user)
          .toLowerCase()
          .includes(trimmedKeyword);
      })
    : [];

  const holders = members.filter((member) => holderIds.has(member.userId));

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex gap-2">
        <TextField
          ref={inputRef}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="이름으로 검색해서 역할 부여"
          className="flex-1"
        />
        <Button type="button" onClick={() => inputRef.current?.focus()}>
          멤버 추가
        </Button>
      </div>

      {isSearching ? (
        candidates.length === 0 ? (
          <EmptyState icon={<UsersIcon />} title="검색 결과가 없습니다" />
        ) : (
          <ul className="flex flex-col gap-1">
            {candidates.map((member) => {
              const user = usersByUserId.get(member.userId);

              return (
                <li key={member.id}>
                  <button
                    type="button"
                    disabled={assignRole.isPending}
                    onClick={() => {
                      assignRole.mutate({
                        targetUserId: member.userId,
                        roleId: role.id,
                      });
                      setKeyword('');
                    }}
                    className="flex h-13 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-left hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserAvatar user={user} size={32} />
                    <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
                      {memberDisplayName(member, user)}
                    </span>
                    <span className="shrink-0 typography-subtext-small text-primary">
                      부여
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : holders.length === 0 ? (
        <EmptyState
          icon={<UsersIcon />}
          title="이 역할을 가진 멤버가 없습니다"
          description="이름으로 검색해서 부여해 보세요"
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {holders.map((member) => {
            const user = usersByUserId.get(member.userId);

            return (
              <li key={member.id}>
                <div className="flex h-13 items-center gap-2.5 rounded-xl px-3 hover:bg-surface-container">
                  <UserAvatar user={user} size={32} />
                  <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
                    {memberDisplayName(member, user)}
                  </span>
                  <button
                    type="button"
                    aria-label={`${memberDisplayName(member, user)} 역할 회수`}
                    disabled={unassignRole.isPending}
                    onClick={() =>
                      unassignRole.mutate({
                        targetUserId: member.userId,
                        roleId: role.id,
                      })
                    }
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
