'use client';

import { useState } from 'react';

import { notFound } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { type Message } from '@/entities/message/model/message';
import { VoiceParticipantBadge } from '@/entities/voice/ui/voice-participant-badge';
import { ChannelHeader } from '@/widgets/channel-header/ui/channel-header';
import { MockChatPanel } from '@/widgets/chat-panel/ui/mock-chat-panel';
import { MemberPanel } from '@/widgets/member-panel/ui/member-panel';
import { MockThreadPanel } from '@/widgets/thread-panel/ui/mock-thread-panel';
import { VoiceStage } from '@/widgets/voice-stage/ui/voice-stage';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
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
      resetKeys={[teamId, channelId]}
    >
      <ChannelView key={channelId} teamId={teamId} channelId={channelId} />
    </QueryBoundary>
  );
}

function ChannelView({
  teamId,
  channelId,
}: {
  teamId: number;
  channelId: number;
}) {
  const [membersOpen, setMembersOpen] = useState(true);
  const [threadRoot, setThreadRoot] = useState<Message | null>(null);
  const { data: channel } = useSuspenseQuery(channelQueries.detail(channelId));

  if (channel.teamId !== teamId) {
    notFound();
  }

  const isVoice = channel.type === 'VOICE';

  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <ChannelHeader
          teamId={teamId}
          channel={channel}
          meta={
            isVoice ? (
              <VoiceParticipantBadge channelId={channelId} />
            ) : undefined
          }
          onToggleMembers={() => setMembersOpen((prev) => !prev)}
        />

        {isVoice ? (
          <VoiceStage channelId={channelId} />
        ) : (
          <MockChatPanel
            channelId={channelId}
            onSelectMessage={setThreadRoot}
          />
        )}
      </div>

      {threadRoot ? (
        <MockThreadPanel
          subtitle={`# ${channel.name}`}
          rootMessage={threadRoot}
          onClose={() => setThreadRoot(null)}
        />
      ) : (
        membersOpen && <MemberPanel channelId={channelId} />
      )}
    </div>
  );
}
