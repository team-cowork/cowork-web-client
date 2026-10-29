'use client';

import { useEffect } from 'react';

import { notFound, redirect, useRouter } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { type Channel } from '@/entities/channel/model/channel';
import { useLastChannelStore } from '@/entities/channel/model/last-channel-store';
import { teamQueries } from '@/entities/team/api/team-queries';
import { TeamProjectGrid } from '@/widgets/team-projects/ui/team-project-grid';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { channelPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

function TeamPageError({ error, resetErrorBoundary }: FallbackProps) {
  if (isAxiosError(error) && error.response?.status === 404) notFound();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="팀을 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요"
        action={
          <Button size="S" variant="weak" onClick={resetErrorBoundary}>
            다시 시도
          </Button>
        }
      />
    </div>
  );
}

function findFirstChannelId(channels: Channel[]): number | null {
  return (
    channels.reduce<Channel | null>(
      (first, channel) =>
        first === null || channel.position < first.position ? channel : first,
      null,
    )?.id ?? null
  );
}

export default function TeamPage() {
  const { teamId } = useRouteIds();
  const lastChannelId = useLastChannelStore((state) =>
    teamId === null ? undefined : state.channelIdByTeam[teamId],
  );

  if (teamId === null) notFound();
  if (lastChannelId !== undefined) redirect(channelPath(teamId, lastChannelId));

  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="팀을 불러오는 중…" />
        </div>
      }
      errorFallback={TeamPageError}
      resetKeys={[teamId]}
    >
      <TeamView teamId={teamId} />
    </QueryBoundary>
  );
}

function TeamView({ teamId }: { teamId: number }) {
  const router = useRouter();
  useSuspenseQuery(teamQueries.detail(teamId));
  const { data: channels } = useSuspenseQuery(channelQueries.byTeam(teamId));
  const entryChannelId = findFirstChannelId(channels);

  useEffect(() => {
    if (entryChannelId !== null) {
      router.replace(channelPath(teamId, entryChannelId));
    }
  }, [router, teamId, entryChannelId]);

  if (entryChannelId !== null) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <LoadingPane label="채널을 불러오는 중…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto bg-background">
      <TeamProjectGrid teamId={teamId} />
    </div>
  );
}
