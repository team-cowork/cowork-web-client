'use client';

import { useLayoutEffect, useRef } from 'react';

import { type Message } from '@/entities/message/model/message';
import { useMessageDraft } from '@/features/message-composer/model/use-message-draft';
import { AttachButton } from '@/features/message-composer/ui/attach-button';
import { MessageComposer } from '@/features/message-composer/ui/message-composer';
import { MessageRow } from '@/widgets/message-list/ui/message-row';
import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

export interface ThreadPanelProps {
  subtitle: string;
  rootMessage: Message;
  /** 오래된 답글부터 순서대로. 불러오는 중이면 비어 있다. */
  replies: Message[] | undefined;
  isRepliesError?: boolean;
  onReloadReplies?: () => void;
  onSendReply: (content: string) => void;
  onRetryReply?: (message: Message) => void;
  onClose: () => void;
  onAttach?: () => void;
  className?: string;
}

const STATUS_TEXT_CLASS =
  'py-2 pl-2 typography-subtext-medium text-on-surface-variant';

/**
 * 원본 메시지와 답글을 보여주는 스레드 패널.
 * 채널·DM 어디서든 원본 메시지와 답글만 넘기면 그대로 사용할 수 있다.
 */
export function ThreadPanel({
  subtitle,
  rootMessage,
  replies,
  isRepliesError = false,
  onReloadReplies,
  onSendReply,
  onRetryReply,
  onClose,
  onAttach,
  className,
}: ThreadPanelProps) {
  const draft = useMessageDraft({ onSubmit: onSendReply });
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastReplyId = replies?.at(-1)?._id;

  // 새 답글이 달리면 맨 아래로 내려 방금 단 답글이 보이게 한다.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container || lastReplyId === undefined) return;

    container.scrollTop = container.scrollHeight;
  }, [lastReplyId]);

  return (
    <aside
      aria-label="스레드"
      className={cn(
        'flex w-100 shrink-0 flex-col border-l border-outline-variant bg-surface',
        className,
      )}
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pr-3.5 pl-4">
        <div className="flex min-w-0 flex-col gap-px">
          <h2 className="typography-label-small text-on-surface">스레드</h2>
          <p className="truncate typography-subtext-small text-on-surface-variant">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          aria-label="스레드 닫기"
          onClick={onClose}
          className="cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <CloseIcon size={18} />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pt-3 pr-3 pl-2"
      >
        <MessageRow
          message={rootMessage}
          timestampFormat="clock"
          showQuote={false}
        />

        <div className="flex shrink-0 items-center gap-2 py-1 pl-2">
          <span className="shrink-0 typography-label-x-small text-on-surface-variant">
            답글 {replies?.length ?? ''}
          </span>
          <span aria-hidden className="h-px flex-1 bg-outline-variant" />
        </div>

        {isRepliesError ? (
          <p className={cn(STATUS_TEXT_CLASS, 'flex items-center gap-2')}>
            답글을 불러오지 못했어요
            {onReloadReplies && (
              <button
                type="button"
                onClick={onReloadReplies}
                className="cursor-pointer typography-label-x-small underline"
              >
                다시 시도
              </button>
            )}
          </p>
        ) : replies === undefined ? (
          <p className={STATUS_TEXT_CLASS}>답글을 불러오는 중…</p>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {replies.map((reply) => (
              <li key={reply.clientMessageId ?? reply._id}>
                <MessageRow
                  message={reply}
                  timestampFormat="clock"
                  showQuote={false}
                  onRetry={onRetryReply}
                />
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="shrink-0 px-3 pt-1 pb-4">
        <MessageComposer
          value={draft.value}
          onChange={draft.onChange}
          onSend={draft.onSend}
          placeholder="스레드에 답장…"
          leading={<AttachButton onClick={onAttach} />}
        />
      </div>
    </aside>
  );
}
