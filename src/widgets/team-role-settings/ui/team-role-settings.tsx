'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { CreateTeamRoleModal } from '@/features/team-roles/ui/create-team-role-modal';
import { EditTeamRoleModal } from '@/features/team-roles/ui/edit-team-role-modal';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type TeamRole } from '@/entities/team/model/team';
import { Button } from '@/shared/ui/button';
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
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <SettingsCard title="역할">
      <div className="flex justify-end">
        <Button size="S" variant="weak" onClick={() => setCreateOpen(true)}>
          역할 만들기
        </Button>
      </div>

      <QueryBoundary
        loadingFallback={ROLE_LIST_SKELETON}
        errorFallback={TeamRoleSettingsError}
        resetKeys={[teamId]}
      >
        <TeamRoleList
          teamId={teamId}
          onCreateRole={() => setCreateOpen(true)}
        />
      </QueryBoundary>

      <CreateTeamRoleModal
        open={createOpen}
        teamId={teamId}
        onClose={() => setCreateOpen(false)}
      />
    </SettingsCard>
  );
}

function TeamRoleList({
  teamId,
  onCreateRole,
}: {
  teamId: number;
  onCreateRole: () => void;
}) {
  const { data: roles } = useSuspenseQuery(teamQueries.roles(teamId));
  const [editingRole, setEditingRole] = useState<TeamRole | null>(null);

  if (roles.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="아직 만들어진 역할이 없습니다"
        description="역할을 만들어 멤버에게 부여해 보세요"
        action={
          <Button size="S" onClick={onCreateRole}>
            역할 만들기
          </Button>
        }
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
              {role.mentionable && (
                <span className="shrink-0 typography-subtext-small text-on-surface-variant">
                  멘션 가능
                </span>
              )}
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
