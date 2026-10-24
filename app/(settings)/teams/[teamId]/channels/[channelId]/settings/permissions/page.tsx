'use client';

import { notFound } from 'next/navigation';

import { ChannelRolePolicySettings } from '@/features/channel-role-policies/ui/channel-role-policy-settings';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function ChannelSettingsPermissionsPage() {
  const { teamId, channelId } = useRouteIds();

  if (teamId === null || channelId === null) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="typography-title-medium text-on-surface">권한</h1>
      <ChannelRolePolicySettings teamId={teamId} channelId={channelId} />
    </div>
  );
}
