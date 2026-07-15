'use client';

import { type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/icon-button';

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
        'border-outline-variant bg-surface focus-within:border-primary flex items-center gap-3 rounded-[20px] border p-4',
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
        className="typography-subtext-large text-on-surface placeholder:text-on-surface-variant max-h-32 flex-1 resize-none bg-transparent py-2.5 focus:outline-none"
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

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
