'use client';

import { type ReactNode } from 'react';

import { type Message } from '@/entities/message/model/message';
import { useMessageDraft } from '@/features/message-composer/model/use-message-draft';
import { AttachButton } from '@/features/message-composer/ui/attach-button';
import { MessageComposer } from '@/features/message-composer/ui/message-composer';
import { MessageList } from '@/widgets/message-list/ui/message-list';
import { cn } from '@/shared/lib/cn';

export interface ChatPanelProps {
  /** 오래된 메시지부터 순서대로 */
  messages: Message[];
  onSendMessage: (content: string) => void;
  onRetryMessage?: (message: Message) => void;
  onSelectMessage?: (message: Message) => void;
  hasOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void;
  placeholder?: string;
  emptyState?: ReactNode;
  onAttach?: () => void;
  className?: string;
}

/**
 * 메시지 목록과 컴포저를 묶은 채팅 본문.
 * 채널·DM·스레드 등 대화가 필요한 화면이라면 어디서든 그대로 사용한다.
 */
export function ChatPanel({
  messages,
  onSendMessage,
  onRetryMessage,
  onSelectMessage,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  placeholder,
  emptyState,
  onAttach,
  className,
}: ChatPanelProps) {
  const draft = useMessageDraft({ onSubmit: onSendMessage });

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <MessageList
        messages={messages}
        onSelectMessage={onSelectMessage}
        onRetryMessage={onRetryMessage}
        hasOlder={hasOlder}
        isLoadingOlder={isLoadingOlder}
        onLoadOlder={onLoadOlder}
        emptyState={emptyState}
      />

      <div className="shrink-0 px-4 pb-6">
        <MessageComposer
          value={draft.value}
          onChange={draft.onChange}
          onSend={draft.onSend}
          placeholder={placeholder}
          leading={<AttachButton onClick={onAttach} />}
        />
      </div>
    </div>
  );
}
