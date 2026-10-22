'use client';

import { useState } from 'react';

import { notFound } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { toThreadRoot } from '@/entities/message/lib/to-thread-root';
import { type Message } from '@/entities/message/model/message';
import { VoiceParticipantBadge } from '@/entities/voice/ui/voice-participant-badge';
import { ChannelHeader } from '@/widgets/channel-header/ui/channel-header';
import { ChannelChatPanel } from '@/widgets/chat-panel/ui/channel-chat-panel';
import { FileSharePanel } from '@/widgets/file-share/ui/file-share-panel';
import { MemberPanel } from '@/widgets/member-panel/ui/member-panel';
import { PinnedMessagesPanel } from '@/widgets/pinned-panel/ui/pinned-messages-panel';
import { ChannelThreadPanel } from '@/widgets/thread-panel/ui/channel-thread-panel';
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

type SidePanel = 'members' | 'pins';

function ChannelView({
  teamId,
  channelId,
}: {
  teamId: number;
  channelId: number;
}) {
  const [sidePanel, setSidePanel] = useState<SidePanel | null>('members');
  const [threadRoot, setThreadRoot] = useState<Message | null>(null);
  const { data: channel } = useSuspenseQuery(channelQueries.detail(channelId));

  if (channel.teamId !== teamId) {
    notFound();
  }

  const isVoice = channel.type === 'VOICE';

  // 스레드가 열려 있으면 오른쪽 패널 자리를 스레드가 쓴다. 다른 패널을 열면 스레드는 닫는다.
  const toggleSidePanel = (panel: SidePanel) => {
    setThreadRoot(null);
    setSidePanel((prev) => (prev === panel && !threadRoot ? null : panel));
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <ChannelHeader
          teamId={teamId}
          channel={channel}
          meta={
            isVoice ? (
              <VoiceParticipantBadge channelId={channelId} />
            ) : undefined
          }
          onToggleMembers={() => toggleSidePanel('members')}
          onTogglePins={isVoice ? undefined : () => toggleSidePanel('pins')}
        />

        {isVoice ? (
          <VoiceStage channelId={channelId} />
        ) : channel.viewType === 'FILE_SHARE' ? (
          <FileSharePanel channelId={channelId} />
        ) : (
          <ChannelChatPanel
            channelId={channelId}
            placeholder={`#${channel.name}에 메시지 보내기`}
            onSelectMessage={(message) => setThreadRoot(toThreadRoot(message))}
          />
        )}
      </div>

      {threadRoot ? (
        <ChannelThreadPanel
          key={threadRoot._id}
          channelId={channelId}
          subtitle={`# ${channel.name}`}
          rootMessage={threadRoot}
          onClose={() => setThreadRoot(null)}
        />
      ) : sidePanel === 'pins' && !isVoice ? (
        <PinnedMessagesPanel
          channelId={channelId}
          subtitle={`# ${channel.name}`}
          onClose={() => setSidePanel(null)}
        />
      ) : (
        sidePanel === 'members' && <MemberPanel channelId={channelId} />
      )}
    </div>
  );
}
