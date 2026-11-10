'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { useSetChannelRolePolicy } from '@/features/channel-role-policies/model/use-set-channel-role-policy';
import { channelQueries } from '@/entities/channel/api/channel-queries';
import { teamQueries } from '@/entities/team/api/team-queries';
import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { Switch } from '@/shared/ui/switch';

const EDITOR_SKELETON = (
  <div className="flex items-start gap-8">
    <div className="flex w-60 shrink-0 flex-col gap-1">
      {Array.from({ length: 3 }, (_, index) => (
        <span
          key={index}
          className="block h-10 animate-pulse rounded-lg bg-surface-container"
        />
      ))}
    </div>
    <span className="block h-64 flex-1 animate-pulse rounded-xl bg-surface-container" />
  </div>
);

export interface ChannelRolePolicySettingsProps {
  teamId: number;
  channelId: number;
}

function ChannelRolePolicySettingsError() {
  return (
    <ErrorState
      title="채널 권한을 불러오지 못했어요"
      description="채널 관리 권한이 있는지 확인하고 잠시 후 다시 시도해 주세요."
    />
  );
}

export function ChannelRolePolicySettings({
  teamId,
  channelId,
}: ChannelRolePolicySettingsProps) {
  return (
    <QueryBoundary
      loadingFallback={EDITOR_SKELETON}
      errorFallback={ChannelRolePolicySettingsError}
      resetKeys={[teamId, channelId]}
    >
      <ChannelRolePolicyEditor teamId={teamId} channelId={channelId} />
    </QueryBoundary>
  );
}

function ChannelRolePolicyEditor({
  teamId,
  channelId,
}: ChannelRolePolicySettingsProps) {
  const { data: roles } = useSuspenseQuery(teamQueries.roles(teamId));
  const { data: policies } = useSuspenseQuery(
    channelQueries.rolePolicies(channelId),
  );
  const { data: channel } = useSuspenseQuery(channelQueries.detail(channelId));
  const { data: permissionGroups } = useSuspenseQuery(
    teamQueries.rolePermissions(),
  );
  const setRolePolicy = useSetChannelRolePolicy(channelId);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  if (roles.length === 0) {
    return (
      <EmptyState
        icon={<SettingsIcon />}
        title="팀 역할이 없어요"
        description="팀 설정에서 역할을 만들고 멤버에게 부여한 뒤 채널 권한을 지정해 주세요"
      />
    );
  }

  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  const savedPermissions =
    policies.find((policy) => policy.roleId === selectedRole.id)?.permissions ??
    {};
  const permissions = {
    ...selectedRole.permissions,
    ...(setRolePolicy.isPending &&
    setRolePolicy.variables.roleId === selectedRole.id
      ? setRolePolicy.variables.permissions
      : savedPermissions),
  };
  const groups = permissionGroups
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) =>
        permission.channelTypes.includes(channel.type),
      ),
    }))
    .filter((group) => group.permissions.length > 0);

  return (
    <div className="flex items-start gap-8">
      <nav aria-label="역할" className="flex w-60 shrink-0 flex-col gap-1">
        <span className="px-2.5 pb-1 typography-subtext-medium text-on-surface-variant">
          역할
        </span>
        <ul className="flex flex-col gap-0.5">
          {roles.map((role) => {
            const active = role.id === selectedRole.id;

            return (
              <li key={role.id}>
                <button
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={cn(
                    'flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 typography-label-small transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
                    active
                      ? 'bg-surface-container text-on-surface'
                      : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface',
                  )}
                >
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-full bg-outline"
                    style={
                      role.colorHex ? { backgroundColor: role.colorHex } : {}
                    }
                  />
                  <span className="truncate">{role.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-8">
        {groups.map((group) => (
          <section key={group.key} className="flex flex-col">
            <h2 className="pb-2 typography-title-small text-on-surface">
              {group.title}
            </h2>
            <ul className="flex flex-col">
              {group.permissions.map((permission) => (
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
                    checked={permissions[permission.key] === true}
                    disabled={setRolePolicy.isPending}
                    onCheckedChange={(allowed) =>
                      setRolePolicy.mutate({
                        roleId: selectedRole.id,
                        permissions: {
                          ...savedPermissions,
                          [permission.key]: allowed,
                        },
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {setRolePolicy.isError && (
          <p className="typography-subtext-medium text-error">
            {setRolePolicy.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
