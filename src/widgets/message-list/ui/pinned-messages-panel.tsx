'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { messageQueries } from '@/entities/message/api/message-queries';
import { MessageRow } from '@/widgets/message-list/ui/message-row';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SidePanel } from '@/shared/ui/side-panel';

export interface PinnedMessagesPanelProps {
  channelId: number;
  subtitle: string;
  onClose: () => void;
}

const STATUS_TEXT_CLASS =
  'px-4 py-2 typography-subtext-medium text-on-surface-variant';

/** 채널에 고정된 메시지를 최신순으로 모아 보여준다. */
export function PinnedMessagesPanel({
  channelId,
  subtitle,
  onClose,
}: PinnedMessagesPanelProps) {
  return (
    <SidePanel
      title="고정된 메시지"
      subtitle={subtitle}
      closeLabel="고정된 메시지 닫기"
      onClose={onClose}
      bodyClassName="pt-3 pr-3 pl-2"
    >
      <QueryBoundary
        loadingFallback={<LoadingPane label="고정된 메시지를 불러오는 중…" />}
        errorFallback={PinnedMessagesError}
        resetKeys={[channelId]}
      >
        <PinnedMessagesContent channelId={channelId} />
      </QueryBoundary>
    </SidePanel>
  );
}

function PinnedMessagesContent({
  channelId,
}: Pick<PinnedMessagesPanelProps, 'channelId'>) {
  const { data: pins } = useSuspenseQuery(messageQueries.pins(channelId));
  return pins.length === 0 ? (
    <p className={STATUS_TEXT_CLASS}>
      아직 고정된 메시지가 없어요. 내 메시지에 마우스를 올려 고정할 수 있어요.
    </p>
  ) : (
    <ol className="flex flex-col gap-2.5 pb-3">
      {pins.map((message) => (
        <li key={message._id}>
          <MessageRow message={message} />
        </li>
      ))}
    </ol>
  );
}

function PinnedMessagesError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="고정된 메시지를 불러오지 못했어요"
      action={
        <Button size="S" variant="weak" onClick={resetErrorBoundary}>
          다시 시도
        </Button>
      }
    />
  );
}
