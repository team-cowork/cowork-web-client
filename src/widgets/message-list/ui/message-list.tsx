'use client';

import { type ReactNode, useEffect, useRef } from 'react';

import { toAuthorTone } from '@/entities/message/lib/author-tone';
import { formatMessageTime } from '@/entities/message/lib/format-message-time';
import { type Message } from '@/entities/message/model/message';
import { MessageItem } from '@/entities/message/ui/message-item';
import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';
import { Markdown } from '@/shared/ui/markdown';

export interface MessageListProps {
  messages: Message[];
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

  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto', className)}>
      <ol className="flex min-h-full flex-col justify-end gap-[18px] py-4 pr-4 pl-2">
        {messages.map((message) => (
          <li key={message.id}>
            <MessageItem
              author={message.authorName}
              timestamp={formatMessageTime(message.createdAt)}
              content={<Markdown>{message.content}</Markdown>}
              avatarSrc={message.authorImageUrl ?? undefined}
              tone={toAuthorTone(message.authorName)}
            />
          </li>
        ))}
      </ol>
      <div ref={bottomRef} />
    </div>
  );
}
