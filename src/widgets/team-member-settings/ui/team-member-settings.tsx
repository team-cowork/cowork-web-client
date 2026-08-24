'use client';

import { useQueries, useSuspenseQuery } from '@tanstack/react-query';

import { TeamMemberRoleMenu } from '@/features/team-members/ui/team-member-role-menu';
import { teamQueries } from '@/entities/team/api/team-queries';
import { toTeamMemberRole } from '@/entities/team/model/team';
import { userQueries } from '@/entities/user/api/user-queries';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { formatDate } from '@/shared/lib/format-date';
import { ErrorState } from '@/shared/ui/error-state';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';

const MEMBER_LIST_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 4 }, (_, index) => (
      <li key={index}>
        <span className="block h-14 animate-pulse rounded-xl bg-surface-container" />
      </li>
    ))}
  </ul>
);

export interface TeamMemberSettingsProps {
  teamId: number;
}

function TeamMemberSettingsError() {
  return (
    <ErrorState
      title="멤버 목록을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
    />
  );
}

export function TeamMemberSettings({ teamId }: TeamMemberSettingsProps) {
  return (
    <SettingsCard title="멤버">
      <QueryBoundary
        loadingFallback={MEMBER_LIST_SKELETON}
        errorFallback={TeamMemberSettingsError}
        resetKeys={[teamId]}
      >
        <TeamMemberList teamId={teamId} />
      </QueryBoundary>
    </SettingsCard>
  );
}

function TeamMemberList({ teamId }: { teamId: number }) {
  const { data: members } = useSuspenseQuery(teamQueries.members(teamId));
  const results = useQueries({
    queries: members.map((member) => userQueries.detail(member.userId)),
  });

  return (
    <ul className="flex flex-col gap-1">
      {members.map((member, index) => {
        const user = results[index]?.data;
        const role = toTeamMemberRole(member.role) ?? 'MEMBER';

        return (
          <li key={member.id}>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-container">
              <UserAvatar user={user} size={36} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate typography-label-small text-on-surface">
                  {user
                    ? (user.nickname ?? user.name)
                    : `사용자 #${member.userId}`}
                </span>
                <span className="truncate typography-subtext-small text-on-surface-variant">
                  {user?.email ?? `${formatDate(member.joinedAt)} 가입`}
                </span>
              </div>
              <TeamMemberRoleMenu
                teamId={teamId}
                targetUserId={member.userId}
                role={role}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
