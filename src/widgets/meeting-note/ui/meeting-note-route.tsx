'use client';

import { type ReactNode } from 'react';

import { notFound } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { isHttpStatus } from '@/shared/api/http-error';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface MeetingNoteRouteProps {
  teamId: number;
  channelId: number;
  children: ReactNode;
}

/**
 * 회의록 하위 화면(작성·템플릿)의 공통 경계.
 * 채널이 이 팀의 회의록 채널일 때만 children을 그린다.
 */
export function MeetingNoteRoute({
  teamId,
  channelId,
  children,
}: MeetingNoteRouteProps) {
  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="불러오는 중…" />
        </div>
      }
      errorFallback={MeetingNoteRouteError}
      resetKeys={[teamId, channelId]}
    >
      <MeetingNoteChannelGate teamId={teamId} channelId={channelId}>
        {children}
      </MeetingNoteChannelGate>
    </QueryBoundary>
  );
}

function MeetingNoteChannelGate({
  teamId,
  channelId,
  children,
}: MeetingNoteRouteProps) {
  const { data: channel } = useSuspenseQuery(channelQueries.detail(channelId));

  if (channel.teamId !== teamId || channel.viewType !== 'MEETING_NOTE') {
    notFound();
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      {children}
    </div>
  );
}

function MeetingNoteRouteError({ error, resetErrorBoundary }: FallbackProps) {
  if (isHttpStatus(error, 404)) notFound();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="화면을 불러오지 못했습니다"
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
