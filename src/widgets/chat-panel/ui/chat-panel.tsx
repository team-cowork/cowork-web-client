'use client';

import { type ReactNode, useRef } from 'react';

import { type Message } from '@/entities/message/model/message';
import { useMessageDraft } from '@/features/message-composer/model/use-message-draft';
import { AttachButton } from '@/features/message-composer/ui/attach-button';
import { MessageComposer } from '@/features/message-composer/ui/message-composer';
import { MessageList } from '@/widgets/message-list/ui/message-list';
import { cn } from '@/shared/lib/cn';

export interface ChatPanelProps {
  /** 오래된 메시지부터 순서대로 */
  messages: Message[];
  /** `false`를 돌려주면 입력값을 비우지 않는다 */
  onSendMessage: (content: string) => boolean | void;
  /** 입력값이 바뀔 때마다 불린다(예: 입력 중 알림) */
  onDraftChange?: (value: string) => void;
  onRetryMessage?: (message: Message) => void;
  onSelectMessage?: (message: Message) => void;
  hasOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void;
  placeholder?: string;
  emptyState?: ReactNode;
  /** 없으면 첨부 버튼을 비활성화한다 */
  onAttachFiles?: (files: FileList) => void;
  /** 컴포저 위에 보여줄 전송 대기 첨부 */
  attachmentDrafts?: ReactNode;
  /** 첨부만으로도 보낼 수 있는지 */
  canSendEmpty?: boolean;
  /** 첨부 업로드 중처럼 잠시 전송을 막아야 할 때 */
  sendDisabled?: boolean;
  className?: string;
}

/**
 * 메시지 목록과 컴포저를 묶은 채팅 본문.
 * 채널·DM·스레드 등 대화가 필요한 화면이라면 어디서든 그대로 사용한다.
 */
export function ChatPanel({
  messages,
  onSendMessage,
  onDraftChange,
  onRetryMessage,
  onSelectMessage,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  placeholder,
  emptyState,
  onAttachFiles,
  attachmentDrafts,
  canSendEmpty = false,
  sendDisabled = false,
  className,
}: ChatPanelProps) {
  const draft = useMessageDraft({
    onSubmit: onSendMessage,
    allowEmpty: canSendEmpty,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      <div className="flex shrink-0 flex-col gap-2 px-4 pb-6">
        {attachmentDrafts}
        <MessageComposer
          value={draft.value}
          onChange={(value) => {
            draft.onChange(value);
            onDraftChange?.(value);
          }}
          onSend={draft.onSend}
          placeholder={placeholder}
          canSendEmpty={canSendEmpty}
          sendDisabled={sendDisabled}
          leading={
            <AttachButton
              onClick={onAttachFiles && (() => fileInputRef.current?.click())}
            />
          }
        />
        {onAttachFiles && (
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(event) => {
              if (event.target.files?.length) {
                onAttachFiles(event.target.files);
              }
              // 같은 파일을 다시 골라도 change가 일어나도록 비운다.
              event.target.value = '';
            }}
          />
        )}
      </div>
    </div>
  );
}
