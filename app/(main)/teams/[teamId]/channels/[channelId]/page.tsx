'use client';

import { useState } from 'react';

import { notFound } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { VoiceParticipantBadge } from '@/entities/voice/ui/voice-participant-badge';
import { ChannelHeader } from '@/widgets/channel-header/ui/channel-header';
import { MemberPanel } from '@/widgets/member-panel/ui/member-panel';
import { VoiceStage } from '@/widgets/voice-stage/ui/voice-stage';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

function ChannelPageError({ error, resetErrorBoundary }: FallbackProps) {
  if (isAxiosError(error) && error.response?.status === 404) notFound();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="채널을 불러오지 못했습니다"
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

export default function ChannelPage() {
  const { teamId, channelId } = useRouteIds();

  if (teamId === null || channelId === null) notFound();

  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="채널을 불러오는 중…" />
        </div>
      }
      errorFallback={ChannelPageError}
    >
      <ChannelView teamId={teamId} channelId={channelId} />
    </QueryBoundary>
  );
}

function ChannelView({ teamId, channelId }: { teamId: number; channelId: number }) {
  const [membersOpen, setMembersOpen] = useState(true);
  const { data: channel } = useSuspenseQuery(channelQueries.detail(channelId));

  if (channel.teamId !== teamId) {
    notFound();
  }

  const isVoice = channel.type === 'VOICE';

  return (
    <div className="flex min-w-0 flex-1">
      <div className="bg-background flex min-w-0 flex-1 flex-col">
        <ChannelHeader
          channel={channel}
          meta={isVoice ? <VoiceParticipantBadge channelId={channelId} /> : undefined}
          onToggleMembers={() => setMembersOpen((prev) => !prev)}
        />

        {isVoice ? (
          <VoiceStage channelId={channelId} />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<ChatIcon />}
              title="채팅 기능 준비 중"
              description="메시지 API 연동 후 이 영역에 대화가 표시됩니다"
              className="max-w-md"
            />
          </div>
        )}
      </div>

      {membersOpen && <MemberPanel channelId={channelId} />}
    </div>
  );
}
