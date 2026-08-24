'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { EditTeamRoleModal } from '@/features/team-roles/ui/edit-team-role-modal';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type TeamRole } from '@/entities/team/model/team';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { UsersIcon } from '@/shared/ui/icons/users-icon';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';

const ROLE_LIST_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 3 }, (_, index) => (
      <li key={index}>
        <span className="block h-13 animate-pulse rounded-xl bg-surface-container" />
      </li>
    ))}
  </ul>
);

export interface TeamRoleSettingsProps {
  teamId: number;
}

function TeamRoleSettingsError() {
  return (
    <ErrorState
      title="역할 목록을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
    />
  );
}

export function TeamRoleSettings({ teamId }: TeamRoleSettingsProps) {
  return (
    <SettingsCard title="역할">
      <QueryBoundary
        loadingFallback={ROLE_LIST_SKELETON}
        errorFallback={TeamRoleSettingsError}
        resetKeys={[teamId]}
      >
        <TeamRoleList teamId={teamId} />
      </QueryBoundary>
    </SettingsCard>
  );
}

function TeamRoleList({ teamId }: { teamId: number }) {
  const { data: roles } = useSuspenseQuery(teamQueries.roles(teamId));
  const [editingRole, setEditingRole] = useState<TeamRole | null>(null);

  if (roles.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="아직 만들어진 역할이 없습니다"
        description="역할은 팀원 초대·API를 통해 생성할 수 있어요"
      />
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-1">
        {roles.map((role) => (
          <li key={role.id}>
            <button
              type="button"
              onClick={() => setEditingRole(role)}
              className="flex h-13 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-surface-container"
            >
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: role.colorHex }}
              />
              <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
                {role.name}
              </span>
              <span className="shrink-0 typography-subtext-small text-on-surface-variant">
                {role.mentionable && '멘션 가능 · '}
                우선순위 {role.priority}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <EditTeamRoleModal
        teamId={teamId}
        role={editingRole}
        onClose={() => setEditingRole(null)}
      />
    </>
  );
}
