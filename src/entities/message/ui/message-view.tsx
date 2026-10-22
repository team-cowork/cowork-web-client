'use client';

import { type ReactNode } from 'react';

import { toAuthorTone } from '@/entities/message/lib/author-tone';
import {
  formatMessageClock,
  formatMessageTime,
} from '@/entities/message/lib/format-message-time';
import { type Message } from '@/entities/message/model/message';
import { useMessageAuthor } from '@/entities/message/model/use-message-author';
import { MessageItem } from '@/entities/message/ui/message-item';
import { MessageQuote } from '@/entities/message/ui/message-quote';
import { MessageReactions } from '@/entities/message/ui/message-reactions';
import { cn } from '@/shared/lib/cn';
import { Markdown } from '@/shared/ui/markdown';

export type MessageTimestampFormat = 'day' | 'clock';

export interface MessageViewProps {
  message: Message;
  timestampFormat?: MessageTimestampFormat;
  /** 답글이면 원본 인용을 함께 보여줄지. 스레드 안에서는 끈다. */
  showQuote?: boolean;
  /** 전송에 실패한 메시지를 다시 보낸다 */
  onRetry?: (message: Message) => void;
  /** 반응 칩을 눌렀을 때 내 반응을 켜고 끈다 */
  onToggleReaction?: (emoji: string) => void;
  /** 마우스를 올리면 뜨는 도구 모음 */
  actions?: ReactNode;
  actionsVisible?: boolean;
  /** 수정 중이면 본문 대신 보여줄 입력 폼 */
  editor?: ReactNode;
  className?: string;
}

/**
 * Message 한 건을 화면에 그리는 표준 표현.
 * 메시지 목록·스레드 등 대화가 노출되는 모든 곳에서 이 컴포넌트를 쓴다.
 */
export function MessageView(props: MessageViewProps) {
  if (props.message.type === 'SYSTEM') {
    return (
      <SystemMessageView message={props.message} className={props.className} />
    );
  }

  return <UserMessageView {...props} />;
}

function SystemMessageView({
  message,
  className,
}: {
  message: Message;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'px-4 py-1 text-center typography-subtext-medium text-on-surface-variant',
        className,
      )}
    >
      {message.content}
    </p>
  );
}

function UserMessageView({
  message,
  timestampFormat = 'day',
  showQuote = true,
  onRetry,
  onToggleReaction,
  actions,
  actionsVisible,
  editor,
  className,
}: MessageViewProps) {
  const author = useMessageAuthor(message.authorId);
  const timestamp =
    timestampFormat === 'clock'
      ? formatMessageClock(message.createdAt)
      : formatMessageTime(message.createdAt);

  return (
    <MessageItem
      author={author.name}
      timestamp={timestamp}
      content={editor ?? <Markdown>{message.content}</Markdown>}
      avatarSrc={author.imageUrl}
      tone={toAuthorTone(message.authorId)}
      quote={
        showQuote &&
        message.parentMessageId !== null && (
          <MessageQuote mentioned={message.mentionedMessage} />
        )
      }
      meta={
        (message.isPinned || message.isEdited) && (
          <>
            {message.isEdited && '(수정됨)'}
            {message.isPinned && (
              <span className="ml-1 text-primary">· 고정됨</span>
            )}
          </>
        )
      }
      reactions={
        <MessageReactions
          reactions={message.reactions}
          onToggle={onToggleReaction}
        />
      }
      actions={actions}
      actionsVisible={actionsVisible}
      footer={
        message.sendStatus === 'failed' && (
          <p className="flex items-center gap-2 typography-subtext-medium text-error">
            전송에 실패했어요
            {onRetry && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRetry(message);
                }}
                className="cursor-pointer typography-label-x-small underline"
              >
                다시 보내기
              </button>
            )}
          </p>
        )
      }
      dimmed={message.sendStatus === 'pending'}
      className={className}
    />
  );
}
