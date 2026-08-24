'use client';

import { useState } from 'react';

import { notFound, useRouter } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';

import { DeleteTeamRoleMenu } from '@/features/team-roles/ui/delete-team-role-menu';
import { TeamRoleDisplayTab } from '@/features/team-roles/ui/team-role-display-tab';
import { TeamRoleMembersTab } from '@/features/team-roles/ui/team-role-members-tab';
import { TeamRolePermissionsTab } from '@/features/team-roles/ui/team-role-permissions-tab';
import { teamQueries } from '@/entities/team/api/team-queries';
import { TeamRoleDetailNav } from '@/widgets/team-role-detail/ui/team-role-detail-nav';
import { cn } from '@/shared/lib/cn';
import { teamSettingsRolesPath } from '@/shared/model/paths';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

const TABS = ['display', 'permissions', 'members'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = {
  display: '표시하기',
  permissions: '권한',
  members: '멤버 관리',
};

export interface TeamRoleDetailProps {
  teamId: number;
  roleId: number;
}

function TeamRoleDetailError() {
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <ErrorState
        title="역할을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
      />
    </div>
  );
}

export function TeamRoleDetail({ teamId, roleId }: TeamRoleDetailProps) {
  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex h-screen flex-1 items-center justify-center">
          <LoadingPane label="역할을 불러오는 중…" />
        </div>
      }
      errorFallback={TeamRoleDetailError}
      resetKeys={[teamId, roleId]}
    >
      <TeamRoleDetailContent teamId={teamId} roleId={roleId} />
    </QueryBoundary>
  );
}

function TeamRoleDetailContent({
  teamId,
  roleId,
}: {
  teamId: number;
  roleId: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('display');
  const { data: roles } = useSuspenseQuery(teamQueries.roles(teamId));
  const { data: members } = useSuspenseQuery(teamQueries.members(teamId));
  const role = roles.find((candidate) => candidate.id === roleId);

  if (!role) notFound();

  const memberCount = members.filter((member) =>
    member.roles.some((r) => r.id === role.id),
  ).length;

  return (
    <div className="flex h-screen">
      <TeamRoleDetailNav teamId={teamId} roles={roles} activeRoleId={roleId} />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto px-10 py-8">
        <div className="flex items-center justify-between gap-4 pr-12">
          <h1 className="typography-title-medium text-on-surface">
            역할 수정 — {role.name}
          </h1>
          <DeleteTeamRoleMenu
            teamId={teamId}
            role={role}
            onDeleted={() => router.push(teamSettingsRolesPath(teamId))}
          />
        </div>

        <div className="mt-6 flex gap-6 border-b border-outline-variant">
          {TABS.map((candidate) => (
            <button
              key={candidate}
              type="button"
              onClick={() => setTab(candidate)}
              className={cn(
                'relative h-10 typography-label-small transition-colors',
                tab === candidate
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
            >
              {TAB_LABEL[candidate]}
              {candidate === 'members' && memberCount > 0 && (
                <span> ({memberCount})</span>
              )}
              {tab === candidate && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="max-w-2xl pt-6">
          {tab === 'display' && (
            <TeamRoleDisplayTab teamId={teamId} role={role} />
          )}
          {tab === 'permissions' && <TeamRolePermissionsTab />}
          {tab === 'members' && (
            <TeamRoleMembersTab teamId={teamId} role={role} />
          )}
        </div>
      </div>
    </div>
  );
}
