'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { messageQueries } from '@/entities/message/api/message-queries';
import { type Message } from '@/entities/message/model/message';
import { useChannelMessageEvents } from '@/entities/message/model/use-channel-message-events';
import { useSendMessage } from '@/features/message-send/model/use-send-message';
import { ChatPanel } from '@/widgets/chat-panel/ui/chat-panel';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface ChannelChatPanelProps {
  channelId: number;
  placeholder?: string;
  onSelectMessage?: (message: Message) => void;
  className?: string;
}

function ChannelChatError({ error, resetErrorBoundary }: FallbackProps) {
  const isForbidden = isAxiosError(error) && error.response?.status === 403;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title={
          isForbidden
            ? '이 대화를 볼 권한이 없습니다'
            : '메시지를 불러오지 못했습니다'
        }
        description={
          isForbidden
            ? '채널 멤버만 메시지를 볼 수 있어요'
            : '잠시 후 다시 시도해 주세요'
        }
        action={
          !isForbidden && (
            <Button size="S" variant="weak" onClick={resetErrorBoundary}>
              다시 시도
            </Button>
          )
        }
      />
    </div>
  );
}

/**
 * 채널(DM 포함)의 메시지를 불러오고 실시간 이벤트를 구독하는 채팅 본문.
 */
export function ChannelChatPanel({
  channelId,
  ...props
}: ChannelChatPanelProps) {
  useChannelMessageEvents(channelId);

  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="메시지를 불러오는 중…" />
        </div>
      }
      errorFallback={ChannelChatError}
      resetKeys={[channelId]}
    >
      <ChannelChatBody channelId={channelId} {...props} />
    </QueryBoundary>
  );
}

function ChannelChatBody({
  channelId,
  placeholder,
  onSelectMessage,
  className,
}: ChannelChatPanelProps) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(messageQueries.byChannel(channelId));
  const { send, retry } = useSendMessage(channelId);

  // 페이지와 페이지 안의 메시지 모두 최신순이라 뒤집어 오래된 순으로 그린다.
  const messages = data.pages.flat().reverse();

  return (
    <ChatPanel
      messages={messages}
      onSendMessage={send}
      onRetryMessage={retry}
      onSelectMessage={onSelectMessage}
      hasOlder={hasNextPage}
      isLoadingOlder={isFetchingNextPage}
      onLoadOlder={() => void fetchNextPage()}
      placeholder={placeholder}
      className={className}
    />
  );
}
