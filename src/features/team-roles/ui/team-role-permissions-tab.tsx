'use client';

import { useUpdateTeamRole } from '@/features/team-roles/model/use-update-team-role';
import { type TeamRole } from '@/entities/team/model/team';
import { RolePermissionList } from '@/entities/team/ui/role-permission-list';
import { ErrorState } from '@/shared/ui/error-state';
import { QueryBoundary } from '@/shared/ui/query-boundary';

const PERMISSION_LIST_SKELETON = (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 4 }, (_, index) => (
      <span
        key={index}
        className="block h-14 animate-pulse rounded-xl bg-surface-container"
      />
    ))}
  </div>
);

function TeamRolePermissionsError() {
  return (
    <ErrorState
      title="권한 목록을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
    />
  );
}

export interface TeamRolePermissionsTabProps {
  teamId: number;
  role: TeamRole;
}

export function TeamRolePermissionsTab({
  teamId,
  role,
}: TeamRolePermissionsTabProps) {
  const updateRole = useUpdateTeamRole(teamId);
  const permissions = {
    ...role.permissions,
    ...(updateRole.isPending && updateRole.variables.roleId === role.id
      ? updateRole.variables.request.permissions
      : {}),
  };

  return (
    <div className="flex flex-col gap-4">
      <QueryBoundary
        loadingFallback={PERMISSION_LIST_SKELETON}
        errorFallback={TeamRolePermissionsError}
      >
        <RolePermissionList
          permissions={permissions}
          disabled={updateRole.isPending}
          onCheckedChange={(key, allowed) =>
            updateRole.mutate({
              roleId: role.id,
              request: { permissions: { ...role.permissions, [key]: allowed } },
            })
          }
        />
      </QueryBoundary>

      {updateRole.isError && (
        <p className="typography-subtext-medium text-error">
          {updateRole.error.message}
        </p>
      )}
    </div>
  );
}
