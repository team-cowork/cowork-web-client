'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCreateTeamRole } from '@/features/team-roles/model/use-create-team-role';
import {
  DEFAULT_ROLE_COLOR_HEX,
  type TeamRole,
} from '@/entities/team/model/team';
import { cn } from '@/shared/lib/cn';
import {
  teamSettingsRoleDetailPath,
  teamSettingsRolesPath,
} from '@/shared/model/paths';
import { ArrowLeftIcon } from '@/shared/ui/icons/arrow-left-icon';
import { PlusIcon } from '@/shared/ui/icons/plus-icon';

export interface TeamRoleDetailNavProps {
  teamId: number;
  roles: TeamRole[];
  activeRoleId: number;
}

export function TeamRoleDetailNav({
  teamId,
  roles,
  activeRoleId,
}: TeamRoleDetailNavProps) {
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
    <nav
      aria-label="역할 목록"
      className="flex w-60 shrink-0 flex-col bg-surface-container-low px-3 py-6"
    >
      <div className="flex h-9 items-center justify-between px-2.5">
        <Link
          href={teamSettingsRolesPath(teamId)}
          className="flex items-center gap-1.5 typography-label-small text-on-surface hover:text-primary"
        >
          <ArrowLeftIcon size={16} />
          뒤로 가기
        </Link>
        <button
          type="button"
          aria-label="역할 만들기"
          disabled={createRole.isPending}
          onClick={handleCreate}
          className="flex size-6 cursor-pointer items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon size={16} />
        </button>
      </div>

      <ul className="mt-2 flex flex-col gap-0.5">
        {roles.map((role) => {
          const active = role.id === activeRoleId;

          return (
            <li key={role.id}>
              <Link
                href={teamSettingsRoleDetailPath(teamId, role.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-9 items-center gap-2.5 rounded-lg px-2.5 typography-label-small transition-colors',
                  active
                    ? 'bg-surface-container text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface',
                )}
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: role.colorHex }}
                />
                <span className="min-w-0 flex-1 truncate">{role.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
