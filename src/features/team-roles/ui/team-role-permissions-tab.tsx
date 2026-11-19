'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { roleErrorMessage } from '@/features/team-roles/lib/role-error-message';
import { useUpdateTeamRole } from '@/features/team-roles/model/use-update-team-role';
import { teamQueries } from '@/entities/team/api/team-queries';
import {
  isOwnerPolicyRole,
  TRANSFER_TEAM_OWNERSHIP,
} from '@/entities/team/lib/team-permission';
import { type TeamRole } from '@/entities/team/model/team';
import { useTeamPermissions } from '@/entities/team/model/use-team-permissions';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { EmptyState } from '@/shared/ui/empty-state';
import { SearchIcon } from '@/shared/ui/icons/search-icon';
import { Switch } from '@/shared/ui/switch';
import { TextField } from '@/shared/ui/text-field';

export interface TeamRolePermissionsTabProps {
  teamId: number;
  role: TeamRole;
}

export function TeamRolePermissionsTab({
  teamId,
  role,
}: TeamRolePermissionsTabProps) {
  const { data: permissionGroups } = useSuspenseQuery(
    teamQueries.rolePermissions(),
  );
  const myPermissions = useTeamPermissions(teamId);
  const updateRole = useUpdateTeamRole(teamId);
  const [keyword, setKeyword] = useState('');

  const ownerPolicy = isOwnerPolicyRole(role);
  // 서버와 같은 기준: 관리자이거나, 역할 관리 권한이 있고 내 최상위 역할보다 낮은 역할
  const manageable =
    !ownerPolicy &&
    (myPermissions.isAdministrator ||
      (myPermissions.can('manage_roles') &&
        role.priority < myPermissions.maxPriority));

  const pendingPermissions =
    updateRole.isPending && updateRole.variables.roleId === role.id
      ? updateRole.variables.request.permissions
      : null;
  const permissions = { ...role.permissions, ...pendingPermissions };

  // 서버에 검색 API가 없어서 받아 둔 권한 목록을 제목·설명으로 거른다
  const normalizedKeyword = useDebouncedValue(
    keyword.trim().toLowerCase(),
    200,
  );
  const matchesKeyword = (text: string) =>
    text.toLowerCase().includes(normalizedKeyword);

  // 소유권 이양은 소유자 정책에만 있어서 다른 역할에서는 보여 주지 않는다
  const groups = permissionGroups
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter(
        (permission) =>
          (ownerPolicy || permission.key !== TRANSFER_TEAM_OWNERSHIP) &&
          (matchesKeyword(permission.title) ||
            matchesKeyword(permission.description)),
      ),
    }))
    .filter((group) => group.permissions.length > 0);

  return (
    <div className="flex flex-col gap-8">
      {myPermissions.ready && !manageable && (
        <p className="rounded-xl bg-surface-container px-4 py-3 typography-subtext-medium text-on-surface-variant">
          {ownerPolicy
            ? '소유자 역할의 권한은 바꿀 수 없어요. 소유자는 멤버 설정에서 소유권을 넘겨서 바꿀 수 있어요.'
            : '이 역할의 권한을 바꿀 수 없어요. 역할 관리 권한이 있어야 하고, 내 가장 높은 역할보다 낮은 역할만 바꿀 수 있어요.'}
        </p>
      )}
      {role.isDefault && (
        <p className="typography-subtext-medium text-on-surface-variant">
          기본 역할의 권한은 팀의 모든 멤버에게 적용돼요.
        </p>
      )}
      {updateRole.isError && (
        <p role="alert" className="typography-subtext-medium text-error">
          {roleErrorMessage(
            updateRole.error,
            '권한을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
          )}
        </p>
      )}

      <TextField
        type="search"
        aria-label="권한 검색"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="권한 검색"
      />

      {groups.length === 0 && (
        <EmptyState icon={<SearchIcon />} title="검색 결과가 없어요" />
      )}

      {groups.map((group) => (
        <section key={group.key} className="flex flex-col">
          <h2 className="pb-2 typography-title-small text-on-surface">
            {group.title}
          </h2>
          <ul className="flex flex-col">
            {group.permissions.map((permission) => {
              const checked = permissions[permission.key] === true;
              // 내가 가진 권한만 새로 켤 수 있다. 끄는 것은 언제든 된다
              const grantable =
                myPermissions.isAdministrator ||
                myPermissions.grantedKeys.has(permission.key);

              return (
                <li
                  key={permission.key}
                  className="flex items-center justify-between gap-6 border-b border-outline-variant py-4 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="typography-body-medium-strong text-on-surface">
                      {permission.title}
                    </span>
                    <span className="typography-subtext-medium text-on-surface-variant">
                      {permission.description}
                    </span>
                  </div>
                  <Switch
                    aria-label={permission.title}
                    checked={checked}
                    disabled={
                      !manageable ||
                      updateRole.isPending ||
                      permission.key === TRANSFER_TEAM_OWNERSHIP ||
                      (!checked && !grantable)
                    }
                    onCheckedChange={(allowed) =>
                      updateRole.mutate({
                        roleId: role.id,
                        request: { permissions: { [permission.key]: allowed } },
                      })
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
