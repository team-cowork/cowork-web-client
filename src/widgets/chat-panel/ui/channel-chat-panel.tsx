'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { messageQueries } from '@/entities/message/api/message-queries';
import { type Message } from '@/entities/message/model/message';
import { useChannelMessageEvents } from '@/entities/message/model/use-channel-message-events';
import { useMarkChannelRead } from '@/features/channel-read/model/use-mark-channel-read';
import { useAttachmentUploads } from '@/features/message-attachment/model/use-attachment-uploads';
import { AttachmentDrafts } from '@/features/message-attachment/ui/attachment-drafts';
import { useSlashCommand } from '@/features/message-command/model/use-slash-command';
import { useSendMessage } from '@/features/message-send/model/use-send-message';
import { useTyping } from '@/features/typing-indicator/model/use-typing';
import { TypingIndicator } from '@/features/typing-indicator/ui/typing-indicator';
import { ChatPanel } from '@/widgets/chat-panel/ui/chat-panel';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface ChannelChatPanelProps {
  channelId: number;
  /** 프로젝트 채널이면 `/issue 제목`으로 GitHub 이슈를 만들 수 있다 */
  projectId?: number | null;
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

const COMMAND_STATUS_TEXT = {
  pending: 'GitHub 이슈 생성을 요청하는 중…',
  success: 'GitHub 이슈 생성을 요청했어요. 결과는 채널 메시지로 알려드려요.',
  error:
    'GitHub 이슈를 만들지 못했어요. 프로젝트에 저장소가 연결돼 있는지 확인해 주세요.',
} as const;

function ChannelChatBody({
  channelId,
  projectId = null,
  placeholder,
  onSelectMessage,
  className,
}: ChannelChatPanelProps) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(messageQueries.byChannel(channelId));
  const { send, retry } = useSendMessage(channelId);
  const attachments = useAttachmentUploads(channelId);
  const command = useSlashCommand(channelId, projectId);
  const typing = useTyping(channelId);

  // 페이지와 페이지 안의 메시지 모두 최신순이라 뒤집어 오래된 순으로 그린다.
  const messages = data.pages.flat().reverse();

  // 전송 중인 내 메시지는 서버 ID가 없으므로 확정된 마지막 메시지까지 읽음 처리한다.
  useMarkChannelRead(
    channelId,
    messages.findLast((message) => message.sendStatus === undefined)?._id,
  );

  return (
    <ChatPanel
      messages={messages}
      onDraftChange={(value) => {
        if (value.trim().length > 0) typing.notify();
        else typing.stop();
      }}
      onSendMessage={(content) => {
        typing.stop();
        if (attachments.confirmedFiles.length === 0 && command.run(content)) {
          return;
        }

        command.reset();
        send(content, attachments.confirmedFiles);
        attachments.clear();
      }}
      onAttachFiles={attachments.add}
      attachmentDrafts={
        <>
          <TypingIndicator userIds={typing.typingUserIds} />
          {command.status !== 'idle' && (
            <p
              role="status"
              className={cn(
                'px-1 typography-subtext-medium',
                command.status === 'error'
                  ? 'text-error'
                  : 'text-on-surface-variant',
              )}
            >
              {COMMAND_STATUS_TEXT[command.status]}
            </p>
          )}
          <AttachmentDrafts
            uploads={attachments.uploads}
            onRemove={attachments.remove}
          />
        </>
      }
      canSendEmpty={attachments.confirmedFiles.length > 0}
      sendDisabled={attachments.isUploading}
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
