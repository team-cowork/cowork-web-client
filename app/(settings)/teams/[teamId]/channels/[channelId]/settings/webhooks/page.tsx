'use client';

import { notFound } from 'next/navigation';

import { ChannelWebhookSettings } from '@/widgets/channel-webhook-settings/ui/channel-webhook-settings';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function ChannelSettingsWebhooksPage() {
  const { teamId, channelId } = useRouteIds();

  if (teamId === null || channelId === null) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="typography-title-medium text-on-surface">웹훅</h1>
      <ChannelWebhookSettings channelId={channelId} />
    </div>
  );
}
