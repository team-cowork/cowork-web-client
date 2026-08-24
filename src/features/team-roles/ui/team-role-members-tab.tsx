'use client';

import { useEffect, useState } from 'react';

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
import { SearchIcon } from '@/shared/ui/icons/search-icon';
import { UsersIcon } from '@/shared/ui/icons/users-icon';
import { Menu } from '@/shared/ui/menu';
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
  const [keyword, setKeyword] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const { data: members = [] } = useQuery(teamQueries.members(teamId));
  const userResults = useQueries({
    queries: members.map((member) => userQueries.detail(member.userId)),
  });
  const usersByUserId = new Map(
    members.map((member, index) => [member.userId, userResults[index]?.data]),
  );

  const unassignRole = useUnassignTeamRole(teamId);

  const holders = members.filter((member) =>
    member.roles.some((r) => r.id === role.id),
  );

  const trimmedKeyword = keyword.trim().toLowerCase();
  const visibleHolders =
    trimmedKeyword.length === 0
      ? holders
      : holders.filter((member) => {
          const user = usersByUserId.get(member.userId);
          return memberDisplayName(member, user)
            .toLowerCase()
            .includes(trimmedKeyword);
        });

  useEffect(() => {
    if (!addOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAddOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addOpen]);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex gap-2">
        <TextField
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="멤버 검색하기"
          className="flex-1"
        />
        <div className="relative">
          {addOpen && (
            <>
              <div
                aria-hidden
                className="fixed inset-0 z-40"
                onClick={() => setAddOpen(false)}
              />
              <div className="absolute top-full right-0 z-50 mt-2 w-72">
                <AddRoleMemberMenu
                  teamId={teamId}
                  role={role}
                  members={members}
                  usersByUserId={usersByUserId}
                  onAdded={() => setAddOpen(false)}
                />
              </div>
            </>
          )}
          <Button type="button" onClick={() => setAddOpen((prev) => !prev)}>
            멤버 추가
          </Button>
        </div>
      </div>

      {visibleHolders.length === 0 ? (
        <EmptyState
          icon={<UsersIcon />}
          title={
            trimmedKeyword
              ? '검색 결과가 없습니다'
              : '이 역할을 가진 멤버가 없습니다'
          }
          description={
            trimmedKeyword ? undefined : '멤버 추가 버튼으로 부여해 보세요'
          }
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {visibleHolders.map((member) => {
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

function AddRoleMemberMenu({
  teamId,
  role,
  members,
  usersByUserId,
  onAdded,
}: {
  teamId: number;
  role: TeamRole;
  members: TeamMember[];
  usersByUserId: Map<number, User | undefined>;
  onAdded: () => void;
}) {
  const [keyword, setKeyword] = useState('');
  const assignRole = useAssignTeamRole(teamId);

  const holderIds = new Set(
    members
      .filter((member) => member.roles.some((r) => r.id === role.id))
      .map((member) => member.userId),
  );

  const trimmedKeyword = keyword.trim().toLowerCase();
  const candidates = members.filter((member) => {
    if (holderIds.has(member.userId)) return false;
    const user = usersByUserId.get(member.userId);
    return memberDisplayName(member, user)
      .toLowerCase()
      .includes(trimmedKeyword);
  });

  return (
    <Menu className="max-h-80 min-w-full overflow-y-auto">
      <div className="flex items-center gap-2 px-1 pb-1.5">
        <SearchIcon size={14} className="shrink-0 text-on-surface-variant" />
        <input
          autoFocus
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="이름으로 검색"
          className="min-w-0 flex-1 bg-transparent typography-subtext-medium text-on-surface placeholder:text-on-surface-variant focus:outline-none"
        />
      </div>
      {candidates.length === 0 ? (
        <p className="px-2.5 py-2 typography-subtext-medium text-on-surface-variant">
          추가할 멤버가 없습니다
        </p>
      ) : (
        candidates.map((member) => {
          const user = usersByUserId.get(member.userId);

          return (
            <button
              key={member.id}
              type="button"
              disabled={assignRole.isPending}
              onClick={() => {
                assignRole.mutate({
                  targetUserId: member.userId,
                  roleId: role.id,
                });
                onAdded();
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserAvatar user={user} size={24} />
              <span className="min-w-0 flex-1 truncate typography-subtext-large text-on-surface">
                {memberDisplayName(member, user)}
              </span>
            </button>
          );
        })
      )}
    </Menu>
  );
}
