'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { messageQueries } from '@/entities/message/api/message-queries';
import { formatMessageTime } from '@/entities/message/lib/format-message-time';
import { useChannelMessageEvents } from '@/entities/message/model/use-channel-message-events';
import { useMarkChannelRead } from '@/features/channel-read/model/use-mark-channel-read';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface VoiceActivityPanelProps {
  channelId: number;
  subtitle: string;
  onClose: () => void;
  className?: string;
}

/**
 * 음성 채널의 입장·퇴장, 통화·라이브 시작과 끝 기록. 읽기 전용이다.
 * 서버가 이 기록을 채널 메시지로 저장해 미읽음에 세므로, 여기서 보면 읽음 처리한다.
 * 기록을 볼 권한이 없는 사용자에게는 서버가 기록을 주지 않아 목록이 비어 있다.
 */
export function VoiceActivityPanel({
  channelId,
  subtitle,
  onClose,
  className,
}: VoiceActivityPanelProps) {
  return (
    <aside
      aria-label="활동 기록"
      className={cn(
        'flex w-100 shrink-0 flex-col border-l border-outline-variant bg-surface',
        className,
      )}
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pr-3.5 pl-4">
        <div className="flex min-w-0 flex-col gap-px">
          <h2 className="typography-label-small text-on-surface">활동 기록</h2>
          <p className="truncate typography-subtext-small text-on-surface-variant">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          aria-label="활동 기록 닫기"
          onClick={onClose}
          className="cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <CloseIcon size={18} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-3">
        <QueryBoundary
          loadingFallback={<LoadingPane label="활동 기록을 불러오는 중…" />}
          errorFallback={VoiceActivityError}
          resetKeys={[channelId]}
        >
          <VoiceActivityContent channelId={channelId} />
        </QueryBoundary>
      </div>
    </aside>
  );
}

function VoiceActivityContent({
  channelId,
}: Pick<VoiceActivityPanelProps, 'channelId'>) {
  useChannelMessageEvents(channelId);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(messageQueries.byChannel(channelId));

  // 페이지와 페이지 안의 메시지 모두 최신순이다.
  const messages = data.pages.flat();

  useMarkChannelRead(channelId, messages[0]?._id);

  if (messages.length === 0) {
    return (
      <p className="py-2 typography-subtext-medium text-on-surface-variant">
        아직 활동 기록이 없어요. 이 채널의 입장과 퇴장, 라이브 기록이 여기에
        쌓여요.
      </p>
    );
  }

  return (
    <>
      <ol className="flex flex-col gap-3 pb-3">
        {messages.map((message) => (
          <li key={message._id} className="flex flex-col gap-0.5">
            <p className="typography-body-small text-on-surface">
              {message.content}
            </p>
            <time
              dateTime={message.createdAt}
              className="typography-subtext-small text-on-surface-variant"
            >
              {formatMessageTime(message.createdAt)}
            </time>
          </li>
        ))}
      </ol>
      {hasNextPage && (
        <Button
          size="S"
          variant="weak"
          color="neutral"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
          className="mb-4 self-start"
        >
          {isFetchingNextPage ? '불러오는 중…' : '이전 기록 더 보기'}
        </Button>
      )}
    </>
  );
}

function VoiceActivityError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="활동 기록을 불러오지 못했어요"
      action={
        <Button size="S" variant="weak" onClick={resetErrorBoundary}>
          다시 시도
        </Button>
      }
    />
  );
}
