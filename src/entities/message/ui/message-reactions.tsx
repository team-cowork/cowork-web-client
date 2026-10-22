'use client';

import { type MessageReaction } from '@/entities/message/model/message';
import { cn } from '@/shared/lib/cn';

export interface MessageReactionsProps {
  reactions: MessageReaction[];
  onToggle?: (emoji: string) => void;
  className?: string;
}

/** 메시지 아래 이모지 반응 칩. 누르면 내 반응을 켜고 끈다. */
export function MessageReactions({
  reactions,
  onToggle,
  className,
}: MessageReactionsProps) {
  if (reactions.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {reactions.map(({ emoji, count, myReaction }) => (
        <li key={emoji}>
          <button
            type="button"
            aria-pressed={myReaction}
            aria-label={`${emoji} 반응 ${count}개`}
            disabled={!onToggle}
            onClick={(event) => {
              event.stopPropagation();
              onToggle?.(emoji);
            }}
            className={cn(
              'flex h-7 cursor-pointer items-center gap-1 rounded-full border px-2 typography-label-x-small disabled:cursor-default',
              myReaction
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-outline-variant bg-surface text-on-surface-variant hover:border-outline',
            )}
          >
            <span aria-hidden>{emoji}</span>
            {count}
          </button>
        </li>
      ))}
    </ul>
  );
}
