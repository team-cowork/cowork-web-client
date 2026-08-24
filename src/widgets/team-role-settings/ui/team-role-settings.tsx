'use client';

import { useRouter } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';

import { useCreateTeamRole } from '@/features/team-roles/model/use-create-team-role';
import { DeleteTeamRoleMenu } from '@/features/team-roles/ui/delete-team-role-menu';
import { teamQueries } from '@/entities/team/api/team-queries';
import { DEFAULT_ROLE_COLOR_HEX } from '@/entities/team/model/team';
import { teamSettingsRoleDetailPath } from '@/shared/model/paths';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { IconButton } from '@/shared/ui/icon-button';
import { EditIcon } from '@/shared/ui/icons/edit-icon';
import { PlusIcon } from '@/shared/ui/icons/plus-icon';
import { UsersIcon } from '@/shared/ui/icons/users-icon';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';

const ROLE_LIST_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 3 }, (_, index) => (
      <li key={index}>
        <span className="block h-14 animate-pulse rounded-xl bg-surface-container" />
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
  const router = useRouter();
  const createRole = useCreateTeamRole(teamId);

  const handleCreate = () => {
    if (createRole.isPending) return;

    createRole.mutate(
      {
        name: '새 역할',
        colorHex: DEFAULT_ROLE_COLOR_HEX,
        priority: 0,
        mentionable: false,
        permissions: [],
      },
      {
        onSuccess: (role) =>
          router.push(teamSettingsRoleDetailPath(teamId, role.id)),
      },
    );
  };

  return (
    <SettingsCard title="역할">
      <div className="flex justify-end">
        <IconButton
          aria-label="역할 만들기"
          size="S"
          variant="border"
          disabled={createRole.isPending}
          onClick={handleCreate}
        >
          <PlusIcon size={16} />
        </IconButton>
      </div>

      <QueryBoundary
        loadingFallback={ROLE_LIST_SKELETON}
        errorFallback={TeamRoleSettingsError}
        resetKeys={[teamId]}
      >
        <TeamRoleList teamId={teamId} onCreateRole={handleCreate} />
      </QueryBoundary>
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
  const router = useRouter();
  const { data: roles } = useSuspenseQuery(teamQueries.roles(teamId));
  const { data: members } = useSuspenseQuery(teamQueries.members(teamId));

  const memberCountByRoleId = new Map<number, number>();
  for (const member of members) {
    for (const role of member.roles) {
      memberCountByRoleId.set(
        role.id,
        (memberCountByRoleId.get(role.id) ?? 0) + 1,
      );
    }
  }

  if (roles.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="아직 만들어진 역할이 없습니다"
        description="역할을 만들어 멤버에게 부여해 보세요"
        action={
          <button
            type="button"
            onClick={onCreateRole}
            className="cursor-pointer typography-label-small text-primary hover:underline"
          >
            역할 만들기
          </button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex h-9 items-center px-3 typography-subtext-small text-on-surface-variant">
        <span className="flex-1">역할 — {roles.length}</span>
        <span className="w-20 shrink-0 text-right">멤버</span>
        <span className="w-[88px] shrink-0" />
      </div>

      <ul className="flex flex-col gap-1">
        {roles.map((role) => (
          <li key={role.id}>
            <div className="flex h-14 items-center gap-3 rounded-xl px-3 transition-colors hover:bg-surface-container">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: role.colorHex }}
              >
                <UsersIcon size={16} className="text-white" />
              </span>
              <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
                {role.name}
              </span>
              <span className="flex w-20 shrink-0 items-center justify-end gap-1 typography-subtext-small text-on-surface-variant">
                {memberCountByRoleId.get(role.id) ?? 0}
                <UsersIcon size={14} />
              </span>
              <span className="flex w-[88px] shrink-0 justify-end gap-1.5">
                <IconButton
                  aria-label={`${role.name} 역할 수정`}
                  size="S"
                  variant="border"
                  onClick={() =>
                    router.push(teamSettingsRoleDetailPath(teamId, role.id))
                  }
                >
                  <EditIcon size={16} />
                </IconButton>
                <DeleteTeamRoleMenu teamId={teamId} role={role} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
