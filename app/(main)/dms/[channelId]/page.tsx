'use client';

import { useState } from 'react';

import { notFound } from 'next/navigation';

import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { toThreadRoot } from '@/entities/message/lib/to-thread-root';
import { type Message } from '@/entities/message/model/message';
import { userQueries } from '@/entities/user/api/user-queries';
import { DmConversationMenu } from '@/features/dm-manage/ui/dm-conversation-menu';
import { ChannelChatPanel } from '@/widgets/chat-panel/ui/channel-chat-panel';
import { DmHeader } from '@/widgets/dm-header/ui/dm-header';
import { PinnedMessagesPanel } from '@/widgets/pinned-panel/ui/pinned-messages-panel';
import { ChannelThreadPanel } from '@/widgets/thread-panel/ui/channel-thread-panel';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

function DmPageError({ error, resetErrorBoundary }: FallbackProps) {
  if (isAxiosError(error) && error.response?.status === 404) notFound();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="대화를 불러오지 못했습니다"
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

export default function DmPage() {
  const { channelId } = useRouteIds();

  if (channelId === null) notFound();

  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="대화를 불러오는 중…" />
        </div>
      }
      errorFallback={DmPageError}
      resetKeys={[channelId]}
    >
      <DmView key={channelId} channelId={channelId} />
    </QueryBoundary>
  );
}

function DmView({ channelId }: { channelId: number }) {
  const [threadRoot, setThreadRoot] = useState<Message | null>(null);
  const [pinsOpen, setPinsOpen] = useState(false);
  const { data: channel } = useSuspenseQuery(channelQueries.detail(channelId));
  const { data: me } = useSuspenseQuery(userQueries.me());
  const { data: members } = useSuspenseQuery(channelQueries.members(channelId));

  const peerResults = useQueries({
    queries: members
      .filter((member) => member.userId !== me.id)
      .map((member) => userQueries.detail(member.userId)),
  });

  if (channel.type !== 'DM') {
    notFound();
  }

  const peer = peerResults[0]?.data;
  const subtitle = peer ? `@ ${peer.nickname ?? peer.name}` : '다이렉트 메시지';

  // 스레드와 고정 메시지는 오른쪽 패널 자리를 함께 쓴다.
  const togglePins = () => {
    setThreadRoot(null);
    setPinsOpen((prev) => !prev || threadRoot !== null);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <DmHeader
          user={peer}
          menu={
            <DmConversationMenu
              channelId={channelId}
              peerId={peer?.id}
              peerName={peer ? (peer.nickname ?? peer.name) : undefined}
            />
          }
          onTogglePins={togglePins}
        />

        <ChannelChatPanel
          channelId={channelId}
          onSelectMessage={(message) => setThreadRoot(toThreadRoot(message))}
        />
      </div>

      {threadRoot ? (
        <ChannelThreadPanel
          key={threadRoot._id}
          channelId={channelId}
          subtitle={subtitle}
          rootMessage={threadRoot}
          onClose={() => setThreadRoot(null)}
        />
      ) : (
        pinsOpen && (
          <PinnedMessagesPanel
            channelId={channelId}
            subtitle={subtitle}
            onClose={() => setPinsOpen(false)}
          />
        )
      )}
    </div>
  );
}
