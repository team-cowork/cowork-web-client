'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { useSetChannelRolePolicy } from '@/features/channel-role-policies/model/use-set-channel-role-policy';
import { channelQueries } from '@/entities/channel/api/channel-queries';
import {
  CHANNEL_READ_PERMISSION,
  CHANNEL_VOICE_CONNECT_PERMISSION,
} from '@/entities/channel/model/channel';
import { teamQueries } from '@/entities/team/api/team-queries';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingRow } from '@/shared/ui/setting-row';
import { SettingsCard } from '@/shared/ui/settings-card';
import { Switch } from '@/shared/ui/switch';

const ROLE_LIST_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 3 }, (_, index) => (
      <li key={index}>
        <span className="block h-16 animate-pulse rounded-xl bg-surface-container" />
      </li>
    ))}
  </ul>
);

const TEXT_ACCESS = {
  checkPermission: CHANNEL_READ_PERMISSION,
  grantPermissions: [CHANNEL_READ_PERMISSION],
  label: '채널 활성화',
  description: '이 역할을 가진 멤버가 채널을 볼 수 있습니다',
};

const VOICE_ACCESS = {
  checkPermission: CHANNEL_VOICE_CONNECT_PERMISSION,
  grantPermissions: [CHANNEL_VOICE_CONNECT_PERMISSION, CHANNEL_READ_PERMISSION],
  label: '음성 채널 활성화',
  description: '이 역할을 가진 멤버가 음성 채널을 보고 입장할 수 있습니다',
};

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
    <SettingsCard title="역할별 열람 권한">
      <QueryBoundary
        loadingFallback={ROLE_LIST_SKELETON}
        errorFallback={ChannelRolePolicySettingsError}
        resetKeys={[teamId, channelId]}
      >
        <ChannelRolePolicyList teamId={teamId} channelId={channelId} />
      </QueryBoundary>
    </SettingsCard>
  );
}

function ChannelRolePolicyList({
  teamId,
  channelId,
}: ChannelRolePolicySettingsProps) {
  const { data: roles } = useSuspenseQuery(teamQueries.roles(teamId));
  const { data: policies } = useSuspenseQuery(
    channelQueries.rolePolicies(channelId),
  );
  const { data: channel } = useQuery(channelQueries.detail(channelId));
  const setRolePolicy = useSetChannelRolePolicy(channelId);

  const policyByRoleId = new Map(
    policies.map((policy) => [policy.roleId, policy.permissions]),
  );
  const access = channel?.type === 'VOICE' ? VOICE_ACCESS : TEXT_ACCESS;

  if (roles.length === 0) {
    return (
      <EmptyState
        icon={<SettingsIcon />}
        title="팀 역할이 없습니다"
        description="팀 설정에서 역할을 만들고 멤버에게 부여한 뒤 채널 열람 권한을 지정하세요"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {roles.map((role) => {
          const isTarget =
            setRolePolicy.isPending &&
            setRolePolicy.variables.roleId === role.id;
          const permissions = isTarget
            ? setRolePolicy.variables.permissions
            : (policyByRoleId.get(role.id) ?? {});

          return (
            <li key={role.id}>
              <SettingRow label={role.name} description={access.description}>
                <Switch
                  aria-label={`${role.name} ${access.label}`}
                  checked={permissions[access.checkPermission] === true}
                  disabled={setRolePolicy.isPending}
                  onCheckedChange={(checked) =>
                    setRolePolicy.mutate({
                      roleId: role.id,
                      permissions: {
                        ...(policyByRoleId.get(role.id) ?? {}),
                        ...Object.fromEntries(
                          access.grantPermissions.map((key) => [key, checked]),
                        ),
                      },
                    })
                  }
                />
              </SettingRow>
            </li>
          );
        })}
      </ul>

      {setRolePolicy.isError && (
        <p className="typography-subtext-medium text-error">
          {setRolePolicy.error.message}
        </p>
      )}
    </div>
  );
}
