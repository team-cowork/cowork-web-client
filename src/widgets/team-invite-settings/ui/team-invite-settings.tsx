'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { useRevokeTeamInvite } from '@/features/team-invite/model/use-revoke-team-invite';
import { teamQueries } from '@/entities/team/api/team-queries';
import {
  INVITE_DURATION_LABEL,
  type Invite,
  type InviteDuration,
} from '@/entities/team/model/team';
import { formatDate } from '@/shared/lib/format-date';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { GlobeIcon } from '@/shared/ui/icons/globe-icon';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';

const INVITE_LIST_SKELETON = (
  <ul className="flex flex-col gap-2">
    {Array.from({ length: 3 }, (_, index) => (
      <li key={index}>
        <span className="block h-16 animate-pulse rounded-xl bg-surface-container" />
      </li>
    ))}
  </ul>
);

function inviteDurationLabel(duration: string): string {
  return INVITE_DURATION_LABEL[duration as InviteDuration] ?? duration;
}

export interface TeamInviteSettingsProps {
  teamId: number;
}

function TeamInviteSettingsError() {
  return (
    <ErrorState
      title="초대 링크를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
    />
  );
}

export function TeamInviteSettings({ teamId }: TeamInviteSettingsProps) {
  return (
    <SettingsCard title="초대 링크">
      <QueryBoundary
        loadingFallback={INVITE_LIST_SKELETON}
        errorFallback={TeamInviteSettingsError}
        resetKeys={[teamId]}
      >
        <TeamInviteList teamId={teamId} />
      </QueryBoundary>
    </SettingsCard>
  );
}

function TeamInviteList({ teamId }: { teamId: number }) {
  const { data: invites } = useSuspenseQuery(teamQueries.invites(teamId));
  const revokeInvite = useRevokeTeamInvite(teamId);
  const [revokingCode, setRevokingCode] = useState<string | null>(null);

  const handleRevoke = (inviteCode: string) => {
    setRevokingCode(inviteCode);
    revokeInvite.mutate(inviteCode, {
      onSettled: () => setRevokingCode(null),
    });
  };

  if (invites.length === 0) {
    return (
      <EmptyState
        icon={<GlobeIcon />}
        title="발급된 초대 링크가 없습니다"
        description="팀원 초대 화면에서 초대 링크를 만들 수 있어요"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {invites.map((invite: Invite) => {
        const revoking =
          revokeInvite.isPending && revokingCode === invite.inviteCode;

        return (
          <li key={invite.inviteCode}>
            <div className="flex items-center gap-3 rounded-xl bg-surface-container px-4 py-3">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="truncate typography-label-small text-on-surface">
                    {invite.inviteCode}
                  </span>
                  {invite.expired && <Badge color="red">만료됨</Badge>}
                </div>
                <span className="truncate typography-subtext-small text-on-surface-variant">
                  {inviteDurationLabel(invite.duration)} ·{' '}
                  {formatDate(invite.createdAt)} 생성
                  {invite.expiresAt &&
                    ` · ${formatDate(invite.expiresAt)} 만료`}
                </span>
              </div>
              <Button
                type="button"
                size="S"
                variant="weak"
                color="danger"
                disabled={invite.expired || revoking}
                onClick={() => handleRevoke(invite.inviteCode)}
              >
                {revoking ? '무효화하는 중…' : '무효화'}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
