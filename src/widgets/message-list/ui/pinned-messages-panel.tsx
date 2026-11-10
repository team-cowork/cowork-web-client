'use client';

import { useQuery } from '@tanstack/react-query';

import { messageQueries } from '@/entities/message/api/message-queries';
import { MessageRow } from '@/widgets/message-list/ui/message-row';
import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

export interface PinnedMessagesPanelProps {
  channelId: number;
  subtitle: string;
  onClose: () => void;
  className?: string;
}

const STATUS_TEXT_CLASS =
  'px-4 py-2 typography-subtext-medium text-on-surface-variant';

/** 채널에 고정된 메시지를 최신순으로 모아 보여준다. */
export function PinnedMessagesPanel({
  channelId,
  subtitle,
  onClose,
  className,
}: PinnedMessagesPanelProps) {
  const {
    data: pins,
    isError,
    refetch,
  } = useQuery(messageQueries.pins(channelId));

  return (
    <aside
      aria-label="고정된 메시지"
      className={cn(
        'flex w-100 shrink-0 flex-col border-l border-outline-variant bg-surface',
        className,
      )}
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pr-3.5 pl-4">
        <div className="flex min-w-0 flex-col gap-px">
          <h2 className="typography-label-small text-on-surface">
            고정된 메시지
          </h2>
          <p className="truncate typography-subtext-small text-on-surface-variant">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          aria-label="고정된 메시지 닫기"
          onClick={onClose}
          className="cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <CloseIcon size={18} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-3 pr-3 pl-2">
        {isError && !pins ? (
          <p className={cn(STATUS_TEXT_CLASS, 'flex items-center gap-2')}>
            고정된 메시지를 불러오지 못했어요
            <button
              type="button"
              onClick={() => void refetch()}
              className="cursor-pointer typography-label-x-small underline"
            >
              다시 시도
            </button>
          </p>
        ) : pins === undefined ? (
          <p className={STATUS_TEXT_CLASS}>불러오는 중…</p>
        ) : pins.length === 0 ? (
          <p className={STATUS_TEXT_CLASS}>
            아직 고정된 메시지가 없어요. 내 메시지에 마우스를 올려 고정할 수
            있어요.
          </p>
        ) : (
          <ol className="flex flex-col gap-2.5 pb-3">
            {pins.map((message) => (
              <li key={message._id}>
                <MessageRow message={message} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}
