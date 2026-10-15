'use client';

import { notFound } from 'next/navigation';

import { ChannelOverviewSettings } from '@/widgets/channel-overview-settings/ui/channel-overview-settings';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function ChannelSettingsOverviewPage() {
  const { teamId, channelId } = useRouteIds();

  if (teamId === null || channelId === null) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="typography-title-medium text-on-surface">개요</h1>
      <ChannelOverviewSettings teamId={teamId} channelId={channelId} />
    </div>
  );
}
