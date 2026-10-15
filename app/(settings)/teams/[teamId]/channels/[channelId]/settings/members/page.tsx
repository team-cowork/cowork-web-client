'use client';

import { notFound } from 'next/navigation';

import { ChannelMemberSettings } from '@/features/channel-members/ui/channel-member-settings';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function ChannelSettingsMembersPage() {
  const { teamId, channelId } = useRouteIds();

  if (teamId === null || channelId === null) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="typography-title-medium text-on-surface">멤버</h1>
      <ChannelMemberSettings teamId={teamId} channelId={channelId} />
    </div>
  );
}
