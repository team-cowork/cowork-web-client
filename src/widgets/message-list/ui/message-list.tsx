'use client';

import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { type Message } from '@/entities/message/model/message';
import { MessageRow } from '@/widgets/message-list/ui/message-row';
import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';

export interface MessageListProps {
  /** 오래된 메시지부터 순서대로 */
  messages: Message[];
  onSelectMessage?: (message: Message) => void;
  onRetryMessage?: (message: Message) => void;
  hasOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void;
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

// 바닥에서 이 거리 안에 있으면 새 메시지가 올 때 따라 내려간다.
const NEAR_BOTTOM_PX = 120;
// 맨 위에 닿기 전에 미리 이전 메시지를 요청한다.
const LOAD_OLDER_MARGIN_PX = 200;

export function MessageList({
  messages,
  onSelectMessage,
  onRetryMessage,
  hasOlder = false,
  isLoadingOlder = false,
  onLoadOlder,
  emptyState = DEFAULT_EMPTY_STATE,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const distanceFromBottomRef = useRef<number | null>(null);

  const firstMessageId = messages[0]?._id;
  const lastMessageId = messages.at(-1)?._id;
  const isLastPending = messages.at(-1)?.sendStatus === 'pending';

  // 이전 메시지가 위에 붙어도 보던 메시지가 밀려나지 않게 바닥 기준 거리를 되돌린다.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container || distanceFromBottomRef.current === null) return;

    container.scrollTop =
      container.scrollHeight - distanceFromBottomRef.current;
    distanceFromBottomRef.current = null;
  }, [firstMessageId]);

  // 바닥을 보고 있었거나 내가 방금 보낸 메시지라면 새 메시지를 따라 내려간다.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (isNearBottomRef.current || isLastPending) {
      container.scrollTop = container.scrollHeight;
    }
  }, [lastMessageId, isLastPending]);

  useEffect(() => {
    const container = scrollRef.current;
    const sentinel = topSentinelRef.current;
    if (!container || !sentinel || !hasOlder || isLoadingOlder) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        distanceFromBottomRef.current =
          container.scrollHeight - container.scrollTop;
        onLoadOlder?.();
      },
      {
        root: container,
        rootMargin: `${LOAD_OLDER_MARGIN_PX}px 0px 0px 0px`,
      },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasOlder, isLoadingOlder, onLoadOlder]);

  if (messages.length === 0) {
    return (
      <div
        className={cn('flex flex-1 items-center justify-center p-6', className)}
      >
        {emptyState}
      </div>
    );
  }

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    isNearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      NEAR_BOTTOM_PX;
  };

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
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={cn('min-h-0 flex-1 overflow-y-auto', className)}
    >
      <div className="flex min-h-full flex-col justify-end py-4 pr-4 pl-2">
        <div ref={topSentinelRef} aria-hidden className="h-px shrink-0" />
        {isLoadingOlder && (
          <p className="py-2 text-center typography-subtext-medium text-on-surface-variant">
            이전 메시지를 불러오는 중…
          </p>
        )}
        <ol className="flex flex-col gap-[18px]">
          {messages.map((message) => {
            const selectable =
              onSelectMessage !== undefined &&
              message.type !== 'SYSTEM' &&
              message.sendStatus === undefined;

            return (
              <li
                key={message.clientMessageId ?? message._id}
                {...(selectable && {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': '메시지 스레드 열기',
                  onClick: handleClick(message),
                  onKeyDown: handleKeyDown(message),
                })}
                className={cn(
                  'rounded-[12px]',
                  selectable &&
                    'cursor-pointer hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
                )}
              >
                <MessageRow message={message} onRetry={onRetryMessage} />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
