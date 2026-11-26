'use client';

import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { LeaveTeamButton } from '@/features/team-members/ui/leave-team-button';
import { RemoveTeamMemberButton } from '@/features/team-members/ui/remove-team-member-button';
import { TransferTeamOwnershipButton } from '@/features/team-members/ui/transfer-team-ownership-button';
import { teamQueries } from '@/entities/team/api/team-queries';
import {
  isOwnerPolicyRole,
  TRANSFER_TEAM_OWNERSHIP,
} from '@/entities/team/lib/team-permission';
import { useTeamPermissions } from '@/entities/team/model/use-team-permissions';
import { userQueries } from '@/entities/user/api/user-queries';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { formatDate } from '@/shared/lib/format-date';
import { Badge } from '@/shared/ui/badge';
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
  const { data: me } = useQuery(userQueries.me());
  const { data: team } = useSuspenseQuery(teamQueries.detail(teamId));
  const { data: members } = useSuspenseQuery(teamQueries.members(teamId));
  const permissions = useTeamPermissions(teamId);
  const canTransferOwnership =
    team.ownerId === me?.id && permissions.can(TRANSFER_TEAM_OWNERSHIP);
  const canKick = permissions.can('kick_members');
  const userResults = useQueries({
    queries: members.map((member) => userQueries.detail(member.userId)),
  });
  const roleResults = useQueries({
    queries: members.map((member) =>
      teamQueries.memberRoles(teamId, member.userId),
    ),
  });

  return (
    <ul className="flex flex-col gap-1">
      {members.map((member, index) => {
        const user = userResults[index]?.data;
        // 소유자 정책 역할은 아래 소유자 배지로 대신 보여 준다
        const customRoles = (roleResults[index]?.data ?? []).filter(
          (role) => !isOwnerPolicyRole(role),
        );
        const isOwner = team.ownerId === member.userId;
        const isMe = me?.id === member.userId;
        const memberName = user
          ? (user.nickname ?? user.name)
          : `사용자 #${member.userId}`;

        return (
          <li key={member.id}>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-container">
              <UserAvatar user={user} size={36} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate typography-label-small text-on-surface">
                  {memberName}
                </span>
                <span className="truncate typography-subtext-small text-on-surface-variant">
                  {user?.email ?? `${formatDate(member.joinedAt)} 가입`}
                </span>
              </div>
              {customRoles.length > 0 && (
                <div className="flex max-w-[200px] flex-wrap justify-end gap-1">
                  {customRoles.map((customRole) => (
                    <span
                      key={customRole.id}
                      className="flex items-center gap-1 rounded-full bg-surface-container px-2 py-1"
                    >
                      <span
                        aria-hidden
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: customRole.colorHex }}
                      />
                      <span className="truncate typography-subtext-small text-on-surface-variant">
                        {customRole.name}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              {isOwner && <Badge color="brand">소유자</Badge>}
              {!isMe && canTransferOwnership && (
                <TransferTeamOwnershipButton
                  teamId={teamId}
                  targetUserId={member.userId}
                  memberName={memberName}
                />
              )}
              {isMe && !isOwner && (
                <LeaveTeamButton teamId={teamId} myUserId={member.userId} />
              )}
              {!isMe && !isOwner && canKick && (
                <RemoveTeamMemberButton
                  teamId={teamId}
                  targetUserId={member.userId}
                  memberName={memberName}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
