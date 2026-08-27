'use client';

import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';

import { type Message } from '@/entities/message/model/message';
import { MessageView } from '@/entities/message/ui/message-view';
import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';

export interface MessageListProps {
  messages: Message[];
  onSelectMessage?: (message: Message) => void;
  emptyState?: ReactNode;
  className?: string;
}

const DEFAULT_EMPTY_STATE = (
  <EmptyState
    icon={<ChatIcon />}
    title="아직 대화가 없습니다"
    description="첫 메시지를 남겨 대화를 시작해 보세요"
    className="max-w-md"
  />
);

export function MessageList({
  messages,
  onSelectMessage,
  emptyState = DEFAULT_EMPTY_STATE,
  className,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages.at(-1)?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lastMessageId]);

  if (messages.length === 0) {
    return (
      <div
        className={cn('flex flex-1 items-center justify-center p-6', className)}
      >
        {emptyState}
      </div>
    );
  }

  // 본문의 마크다운 링크를 눌렀을 때는 스레드를 열지 않는다.
  const handleClick =
    (message: Message) => (event: MouseEvent<HTMLElement>) => {
      if ((event.target as HTMLElement).closest('a')) return;

      onSelectMessage?.(message);
    };

  const handleKeyDown =
    (message: Message) => (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (event.target !== event.currentTarget) return;

      event.preventDefault();
      onSelectMessage?.(message);
    };

  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto', className)}>
      <ol className="flex min-h-full flex-col justify-end gap-[18px] py-4 pr-4 pl-2">
        {messages.map((message) => (
          <li
            key={message.id}
            {...(onSelectMessage && {
              role: 'button',
              tabIndex: 0,
              'aria-label': `${message.authorName}의 메시지 스레드 열기`,
              onClick: handleClick(message),
              onKeyDown: handleKeyDown(message),
            })}
            className={cn(
              'rounded-[12px]',
              onSelectMessage &&
                'cursor-pointer hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
            )}
          >
            <MessageView message={message} />
          </li>
        ))}
      </ol>
      <div ref={bottomRef} />
    </div>
  );
}
