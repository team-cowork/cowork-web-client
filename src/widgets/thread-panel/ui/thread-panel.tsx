'use client';

import { type Message } from '@/entities/message/model/message';
import { MessageView } from '@/entities/message/ui/message-view';
import { useMessageDraft } from '@/features/message-composer/model/use-message-draft';
import { AttachButton } from '@/features/message-composer/ui/attach-button';
import { MessageComposer } from '@/features/message-composer/ui/message-composer';
import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

export interface ThreadPanelProps {
  subtitle: string;
  rootMessage: Message;
  replies: Message[];
  onSendReply: (content: string) => void;
  onClose: () => void;
  onAttach?: () => void;
  className?: string;
}

/**
 * 원본 메시지와 답글을 보여주는 스레드 패널.
 * 채널·DM 어디서든 원본 메시지와 답글만 넘기면 그대로 사용할 수 있다.
 */
export function ThreadPanel({
  subtitle,
  rootMessage,
  replies,
  onSendReply,
  onClose,
  onAttach,
  className,
}: ThreadPanelProps) {
  const draft = useMessageDraft({ onSubmit: onSendReply });

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

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pt-3 pr-3 pl-2">
        <MessageView message={rootMessage} timestampFormat="clock" />

        <div className="flex shrink-0 items-center gap-2 py-1 pl-2">
          <span className="shrink-0 typography-label-x-small text-on-surface-variant">
            답글 {replies.length}
          </span>
          <span aria-hidden className="h-px flex-1 bg-outline-variant" />
        </div>

        <ol className="flex flex-col gap-2.5">
          {replies.map((reply) => (
            <li key={reply.id}>
              <MessageView message={reply} timestampFormat="clock" />
            </li>
          ))}
        </ol>
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
