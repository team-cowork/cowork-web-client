'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ChannelOverviewForm } from '@/features/channel-settings/ui/channel-overview-form';
import { DeleteChannelSection } from '@/features/channel-settings/ui/delete-channel-section';
import { channelQueries } from '@/entities/channel/api/channel-queries';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';

export interface ChannelOverviewSettingsProps {
  teamId: number;
  channelId: number;
}

function ChannelOverviewSettingsError() {
  return (
    <ErrorState
      title="채널 정보를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
    />
  );
}

export function ChannelOverviewSettings({
  teamId,
  channelId,
}: ChannelOverviewSettingsProps) {
  return (
    <QueryBoundary
      loadingFallback={<LoadingPane />}
      errorFallback={ChannelOverviewSettingsError}
      resetKeys={[teamId, channelId]}
    >
      <ChannelOverviewSettingsContent teamId={teamId} channelId={channelId} />
    </QueryBoundary>
  );
}

function ChannelOverviewSettingsContent({
  teamId,
  channelId,
}: {
  teamId: number;
  channelId: number;
}) {
  const { data: channel } = useSuspenseQuery(channelQueries.detail(channelId));

  return (
    <div className="flex flex-col gap-3.5">
      <SettingsCard title="기본 정보">
        <ChannelOverviewForm teamId={teamId} channel={channel} />
      </SettingsCard>
      <DeleteChannelSection teamId={teamId} channel={channel} />
    </div>
  );
}
