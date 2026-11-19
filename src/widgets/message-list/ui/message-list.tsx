'use client';

import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';

import { type Message } from '@/entities/message/model/message';
import { useEditingMessageStore } from '@/features/message-edit/model/editing-message-store';
import { MessageRow } from '@/widgets/message-list/ui/message-row';
import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';

export interface MessageListProps {
  /** 오래된 메시지부터 순서대로 */
  messages: Message[];
  onSelectMessage?: (message: Message) => void;
  onRetryMessage?: (message: Message) => void;
  onReplyMessage?: (message: Message) => void;
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

// 아직 재지 않은 행의 높이. 그려지면 실제 높이로 바뀐다.
const ESTIMATED_ROW_PX = 72;
const ROW_GAP_PX = 18;
// 화면 밖 위아래로 미리 그려 두는 행 수.
const OVERSCAN_ROWS = 8;
// 바닥에서 이 거리 안에 있으면 새 메시지가 올 때 따라 내려간다.
const NEAR_BOTTOM_PX = 120;
// 바닥에 붙어 있다고 보는 거리. 이미지가 늦게 떠서 행이 커져도 이 안이면 바닥을 유지한다.
const PINNED_BOTTOM_PX = 8;
// 맨 위에 닿기 전에 미리 이전 메시지를 요청한다.
const LOAD_OLDER_MARGIN_PX = 400;

export function MessageList({
  messages,
  onSelectMessage,
  onRetryMessage,
  onReplyMessage,
  hasOlder = false,
  isLoadingOlder = false,
  onLoadOlder,
  emptyState = DEFAULT_EMPTY_STATE,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const isPinnedRef = useRef(true);
  const distanceFromBottomRef = useRef<number | null>(null);
  const olderRequestedRef = useRef(false);

  const editingMessageId = useEditingMessageStore(
    (state) => state.editingMessageId,
  );
  const editingIndex =
    editingMessageId === null
      ? -1
      : messages.findIndex((message) => message._id === editingMessageId);

  // 돌려주는 함수를 메모하면 화면이 낡아지므로 컴파일러가 이 컴포넌트의 메모를 건너뛴다. 의도한 동작이다.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_PX,
    gap: ROW_GAP_PX,
    overscan: OVERSCAN_ROWS,
    getItemKey: (index) => {
      const message = messages[index];
      return message ? (message.clientMessageId ?? message._id) : index;
    },
    // 수정 중인 행은 화면 밖으로 나가도 그대로 두어 입력 중인 글이 사라지지 않게 한다.
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range);
      if (editingIndex < 0 || indexes.includes(editingIndex)) return indexes;

      return [...indexes, editingIndex].sort((a, b) => a - b);
    },
  });

  const firstMessageId = messages[0]?._id;
  const lastMessageId = messages.at(-1)?._id;
  const isLastPending = messages.at(-1)?.sendStatus === 'pending';

  // 이 목록이 사라지면 수정 중이던 메시지는 더는 수정 중이 아니다.
  useEffect(
    () => () => useEditingMessageStore.setState({ editingMessageId: null }),
    [],
  );

  // 이전 메시지가 위에 붙어도 보던 메시지가 밀려나지 않게 바닥 기준 거리를 되돌린다.
  // 이미 잰 아래쪽 행은 높이가 그대로라 바닥 기준이 가장 정확하다.
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
      isPinnedRef.current = true;
    }
  }, [lastMessageId, isLastPending]);

  // 새로 그려진 행의 실제 높이나 이미지 로드로 목록이 길어져도 바닥에 붙어 있었다면 바닥을 유지한다.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (
      !container ||
      !isPinnedRef.current ||
      distanceFromBottomRef.current !== null
    ) {
      return;
    }

    const distance =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distance > 1) container.scrollTop = container.scrollHeight;
  });

  const requestOlder = () => {
    const container = scrollRef.current;
    if (
      !container ||
      !hasOlder ||
      isLoadingOlder ||
      olderRequestedRef.current ||
      container.scrollTop >= LOAD_OLDER_MARGIN_PX
    ) {
      return;
    }

    olderRequestedRef.current = true;
    isPinnedRef.current = false;
    distanceFromBottomRef.current =
      container.scrollHeight - container.scrollTop;
    onLoadOlder?.();
  };

  // 이전 메시지를 다 읽어 오기 전까지는 다음 요청을 막는다.
  useEffect(() => {
    if (!isLoadingOlder) olderRequestedRef.current = false;
  }, [isLoadingOlder]);

  // 처음 열 때나 한 번 읽고도 화면이 덜 찼을 때 이어서 읽는다.
  useEffect(() => {
    requestOlder();
  });

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

    const distance =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distance < NEAR_BOTTOM_PX;
    isPinnedRef.current = distance < PINNED_BOTTOM_PX;
    requestOlder();
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
        {isLoadingOlder && (
          <p className="py-2 text-center typography-subtext-medium text-on-surface-variant">
            이전 메시지를 불러오는 중…
          </p>
        )}
        <ol
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index];
            if (!message) return null;

            const selectable =
              onSelectMessage !== undefined &&
              message.type !== 'SYSTEM' &&
              message.sendStatus === undefined;

            return (
              <li
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{ transform: `translateY(${virtualItem.start}px)` }}
                {...(selectable && {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': '메시지 스레드 열기',
                  onClick: handleClick(message),
                  onKeyDown: handleKeyDown(message),
                })}
                className={cn(
                  'absolute top-0 left-0 w-full rounded-[12px]',
                  selectable &&
                    'cursor-pointer hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
                )}
              >
                <MessageRow
                  message={message}
                  onRetry={onRetryMessage}
                  onReply={onReplyMessage}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
