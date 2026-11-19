'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { messageQueries } from '@/entities/message/api/message-queries';
import { formatMessageTime } from '@/entities/message/lib/format-message-time';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SidePanel } from '@/shared/ui/side-panel';

export interface VoiceActivityPanelProps {
  channelId: number;
  subtitle: string;
  onClose: () => void;
}

/**
 * 음성 채널의 입장·퇴장, 통화·라이브 시작과 끝 기록. 읽기 전용이다.
 * 읽음 처리와 실시간 갱신은 [VoiceLogReader]가 맡는다.
 * 기록을 볼 권한이 없는 사용자에게는 서버가 기록을 주지 않아 목록이 비어 있다.
 */
export function VoiceActivityPanel({
  channelId,
  subtitle,
  onClose,
}: VoiceActivityPanelProps) {
  return (
    <SidePanel
      title="활동 기록"
      subtitle={subtitle}
      closeLabel="활동 기록 닫기"
      onClose={onClose}
      bodyClassName="px-4 pt-3"
    >
      <QueryBoundary
        loadingFallback={<LoadingPane label="활동 기록을 불러오는 중…" />}
        errorFallback={VoiceActivityError}
        resetKeys={[channelId]}
      >
        <VoiceActivityContent channelId={channelId} />
      </QueryBoundary>
    </SidePanel>
  );
}

function VoiceActivityContent({
  channelId,
}: Pick<VoiceActivityPanelProps, 'channelId'>) {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(messageQueries.byChannel(channelId));

  // 페이지와 페이지 안의 메시지 모두 최신순이다.
  const messages = data.pages.flat();

  if (messages.length === 0) {
    return (
      <p className="py-2 typography-subtext-medium text-on-surface-variant">
        보여 줄 활동 기록이 아직 없어요. 입장과 퇴장, 라이브 기록이 여기에
        쌓이고, 기록을 볼 권한이 없으면 기록이 있어도 보이지 않아요.
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
      {isFetchNextPageError && (
        <p role="alert" className="pb-2 typography-subtext-medium text-error">
          이전 기록을 불러오지 못했어요. 다시 시도해 주세요.
        </p>
      )}
      {hasNextPage && (
        <Button
          size="S"
          variant="weak"
          color="neutral"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
          className="mb-4 self-start"
        >
          {isFetchingNextPage
            ? '불러오는 중…'
            : isFetchNextPageError
              ? '다시 시도'
              : '이전 기록 더 보기'}
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
