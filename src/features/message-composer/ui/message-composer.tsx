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
  className?: string;
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  placeholder = '메시지를 입력하세요. Markdown 지원',
  leading,
  className,
}: MessageComposerProps) {
  const canSend = value.trim().length > 0;

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
        aria-label="전송"
        disabled={!canSend}
        onClick={onSend}
        className="rounded-[14px]"
      >
        <SendIcon />
      </IconButton>
    </div>
  );
}
