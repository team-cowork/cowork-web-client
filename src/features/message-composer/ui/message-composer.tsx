'use client';

import { type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { SendIcon } from '@/shared/ui/icons/send-icon';

export interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  leading?: ReactNode;
  /** 입력이 비어 있어도 전송할 수 있는지(예: 첨부만 보내기) */
  canSendEmpty?: boolean;
  /** 첨부 업로드 중처럼 잠시 전송을 막아야 할 때 */
  sendDisabled?: boolean;
  /** 전송을 막은 이유. 전송 버튼에 마우스를 올리거나 스크린 리더로 읽을 때 알려준다. */
  sendDisabledReason?: string;
  className?: string;
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  placeholder = '메시지를 입력하세요. Markdown 지원',
  leading,
  canSendEmpty = false,
  sendDisabled = false,
  sendDisabledReason,
  className,
}: MessageComposerProps) {
  const canSend = !sendDisabled && (canSendEmpty || value.trim().length > 0);
  const reason = sendDisabled ? sendDisabledReason : undefined;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[20px] border border-outline-variant bg-surface p-4 focus-within:border-primary',
        className,
      )}
    >
      {leading && <span className="shrink-0">{leading}</span>}
      <textarea
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="max-h-32 flex-1 resize-none bg-transparent py-2.5 typography-subtext-large text-on-surface placeholder:text-on-surface-variant focus:outline-none"
      />
      <IconButton
        size="M"
        variant="fill"
        aria-label={reason ? `전송 (${reason})` : '전송'}
        title={reason}
        disabled={!canSend}
        onClick={onSend}
        className="rounded-[14px]"
      >
        <SendIcon />
      </IconButton>
    </div>
  );
}
