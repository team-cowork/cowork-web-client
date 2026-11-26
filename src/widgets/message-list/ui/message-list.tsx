'use client';

import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';

import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';

import { continuesPrevious } from '@/entities/message/lib/message-group';
import { type Message } from '@/entities/message/model/message';
import {
  editingKeyOf,
  useEditingMessageStore,
} from '@/features/message-edit/model/editing-message-store';
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
// 사용자가 조금만 올려도 다시 끌려 내려오지 않도록 작게 둔다.
const PINNED_BOTTOM_PX = 2;
// 맨 위에 닿기 전에 미리 이전 메시지를 요청한다.
const LOAD_OLDER_MARGIN_PX = 400;
// 스크롤 영역 맨 위에서 목록이 시작하는 곳까지의 거리. 안쪽 위 여백(`py-4`)과 같다.
const LIST_OFFSET_PX = 16;

/** 이전 메시지를 요청한 시점의 위치. 붙은 뒤 보던 메시지가 밀려나지 않게 되돌린다. */
interface OlderAnchor {
  /** 요청 때의 `scrollHeight - scrollTop` */
  distance: number;
  /** 요청 때의 첫 메시지. 이게 그대로면 아무것도 붙지 않은 것이다. */
  firstMessageId: string | undefined;
}

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
  const anchorRef = useRef<OlderAnchor | null>(null);
  const olderRequestedRef = useRef(false);
  // 이전 메시지 요청이 실패하거나 빈 페이지로 끝났다. 사용자가 다시 스크롤하기 전에는 다시 요청하지 않는다.
  const olderStalledRef = useRef(false);

  // 이 목록의 수정 상태만 구분한다. 같은 메시지가 스레드·고정 패널에 보여도 거기서는 열리지 않는다.
  const surfaceId = useId();
  const editingKey = useEditingMessageStore((state) => state.editingKey);
  const editingIndex =
    editingKey === null
      ? -1
      : messages.findIndex(
          (message) => editingKeyOf(surfaceId, message._id) === editingKey,
        );

  // 돌려주는 함수를 메모하면 화면이 낡아지므로 컴파일러가 이 컴포넌트의 메모를 건너뛴다. 의도한 동작이다.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    // 앞 메시지와 이어지는 행(compact)은 위 간격이 없다. 간격은 행 안쪽 위 여백으로 두어 높이에 포함시킨다.
    estimateSize: (index) =>
      ESTIMATED_ROW_PX +
      (index > 0 && !continuesPrevious(messages[index - 1], messages[index])
        ? ROW_GAP_PX
        : 0),
    overscan: OVERSCAN_ROWS,
    scrollMargin: LIST_OFFSET_PX,
    // 처음 그릴 때부터 맨 아래 근처 행을 그려, 맨 위 행을 그렸다가 점프하지 않게 한다.
    initialOffset: messages.length * (ESTIMATED_ROW_PX + ROW_GAP_PX),
    getItemKey: (index) => {
      const message = messages[index];
      return message.clientMessageId ?? message._id;
    },
    // 수정 중인 행은 화면 밖으로 나가도 그대로 두어 입력 중인 글이 사라지지 않게 한다.
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range);
      if (editingIndex < 0 || indexes.includes(editingIndex)) return indexes;

      return [...indexes, editingIndex].sort((a, b) => a - b);
    },
  });
  const totalSize = virtualizer.getTotalSize();

  const firstMessageId = messages[0]?._id;
  const lastMessageId = messages.at(-1)?._id;
  const isLastPending = messages.at(-1)?.sendStatus === 'pending';

  // 이 목록이 사라질 때, 이 목록의 메시지를 수정 중이었다면 수정 상태를 비운다.
  // 스레드·고정 패널에서 수정 중인 것은 건드리지 않는다.
  useEffect(
    () => () => {
      const { editingKey: key, stopEditing } =
        useEditingMessageStore.getState();
      if (key?.startsWith(`${surfaceId}|`)) stopEditing(key);
    },
    [surfaceId],
  );

  // 이전 메시지가 위에 붙어도 보던 메시지가 밀려나지 않게 바닥 기준 거리를 되돌린다.
  // 이미 잰 아래쪽 행은 높이가 그대로라 바닥 기준이 가장 정확하다.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    const anchor = anchorRef.current;
    if (!container || !anchor || anchor.firstMessageId === firstMessageId) {
      return;
    }

    container.scrollTop = container.scrollHeight - anchor.distance;
    anchorRef.current = null;
    isPinnedRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      PINNED_BOTTOM_PX;
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
  // 전체 높이가 바뀔 때만 확인해, 사용자가 올리는 중에 다른 렌더가 끼어도 끌어내리지 않는다.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container || !isPinnedRef.current || anchorRef.current !== null) {
      return;
    }

    const distance =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distance > 1) container.scrollTop = container.scrollHeight;
  }, [totalSize]);

  const requestOlder = (byUser: boolean) => {
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
    // 실패하거나 빈 페이지로 끝난 뒤에는 사용자가 다시 스크롤했을 때만 다시 요청한다.
    if (olderStalledRef.current && !byUser) return;

    olderRequestedRef.current = true;
    olderStalledRef.current = false;
    isPinnedRef.current = false;
    anchorRef.current = {
      distance: container.scrollHeight - container.scrollTop,
      firstMessageId,
    };
    onLoadOlder?.();
  };

  // 이전 메시지 요청이 끝났다. 목록이 그대로면 실패나 빈 페이지이니 기억해 두고 위치 기록은 버린다.
  useEffect(() => {
    if (isLoadingOlder) return;

    olderRequestedRef.current = false;
    if (anchorRef.current?.firstMessageId === firstMessageId) {
      anchorRef.current = null;
      olderStalledRef.current = true;
      const container = scrollRef.current;
      if (container) {
        isPinnedRef.current =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          PINNED_BOTTOM_PX;
      }
    }
  }, [isLoadingOlder, firstMessageId]);

  // 처음 열 때나 한 번 읽고도 화면이 덜 찼을 때 이어서 읽는다.
  const requestOlderAutomatically = useEffectEvent(() => requestOlder(false));
  useEffect(() => {
    requestOlderAutomatically();
  }, [hasOlder, isLoadingOlder, firstMessageId, messages.length]);

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
    requestOlder(true);
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
        {/* 높이가 0인 sticky 칸에 띄워, 나타나고 사라져도 목록 위치가 밀리지 않게 한다. */}
        <div className="sticky top-0 z-10 h-0">
          {isLoadingOlder && (
            <p className="absolute inset-x-0 top-0 mx-auto w-fit rounded-full bg-surface px-3 py-1 typography-subtext-medium text-on-surface-variant">
              이전 메시지를 불러오는 중…
            </p>
          )}
        </div>
        <ol className="relative w-full" style={{ height: totalSize }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index];
            const compact = continuesPrevious(
              messages[virtualItem.index - 1],
              message,
            );
            const selectable =
              onSelectMessage !== undefined &&
              message.type !== 'SYSTEM' &&
              message.sendStatus === undefined;

            // 바깥 li는 위치와 높이 측정, 위 간격만 맡고 눌림·호버 모양은 안쪽 div가 맡는다.
            // 간격이 눌림 영역과 호버 배경에 들어가지 않게 하려는 것이다.
            return (
              <li
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                // transform은 행마다 쌓임 맥락을 만들어 반응 피커 같은 fixed 요소를 가두므로 top을 쓴다.
                style={{ top: virtualItem.start - LIST_OFFSET_PX }}
                className={cn(
                  'absolute left-0 w-full',
                  virtualItem.index > 0 && !compact && 'pt-[18px]',
                )}
              >
                <div
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
                  <MessageRow
                    message={message}
                    onRetry={onRetryMessage}
                    onReply={onReplyMessage}
                    editSurfaceId={surfaceId}
                    compact={compact}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
