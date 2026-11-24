'use client';

import { useState } from 'react';

import { useQueries, useSuspenseQuery } from '@tanstack/react-query';

import { roleErrorMessage } from '@/features/team-roles/lib/role-error-message';
import { useAssignTeamRole } from '@/features/team-roles/model/use-assign-team-role';
import { useUnassignTeamRole } from '@/features/team-roles/model/use-unassign-team-role';
import { teamQueries } from '@/entities/team/api/team-queries';
import { isOwnerPolicyRole } from '@/entities/team/lib/team-permission';
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

  // 두 역할은 서버가 직접 부여·회수를 막는다
  if (role.isDefault) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="모든 멤버에게 자동으로 적용돼요"
        description="기본 역할은 따로 부여하거나 회수할 수 없어요"
      />
    );
  }
  if (isOwnerPolicyRole(role)) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="팀 소유자에게만 적용돼요"
        description="멤버 설정에서 소유권을 넘기면 새 소유자에게 옮겨 가요"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      <TextField
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="이름으로 검색해서 역할 부여"
      />

      {/* 멤버 목록은 상위 TeamRoleDetail이 같은 쿼리를 이미 suspense로 받아 둔다 */}
      <TeamRoleMembersContent teamId={teamId} role={role} keyword={keyword} />
    </div>
  );
}

function TeamRoleMembersContent({
  teamId,
  role,
  keyword,
}: TeamRoleMembersTabProps & { keyword: string }) {
  const { data: members } = useSuspenseQuery(teamQueries.members(teamId));
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

  const failedMutation = [assignRole, unassignRole].find(
    (mutation) => mutation.isError,
  );

  if (visibleMembers.length === 0) {
    return <EmptyState icon={<UsersIcon />} title="검색 결과가 없습니다" />;
  }

  return (
    <>
      {failedMutation && (
        <p role="alert" className="typography-subtext-medium text-error">
          {roleErrorMessage(
            failedMutation.error,
            '역할을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.',
          )}
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {visibleMembers.map((member) => {
          const user = usersByUserId.get(member.userId);
          const name = userDisplayName(user, `사용자 #${member.userId}`);
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
    </>
  );
}
