import { type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { Avatar } from './avatar';

export interface MessageItemProps {
  author: string;
  timestamp: string;
  content: ReactNode;
  avatarSrc?: string;
  className?: string;
}

export function MessageItem({
  author,
  timestamp,
  content,
  avatarSrc,
  className,
}: MessageItemProps) {
  return (
    <div className={cn('bg-surface flex gap-4 rounded-[14px] px-4 pt-4 pb-[14px]', className)}>
      <Avatar src={avatarSrc} name={author} size={44} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="typography-label-x-small text-on-surface-variant">
          {author} · {timestamp}
        </p>
        <div className="typography-subtext-large text-on-surface break-words">{content}</div>
      </div>
    </div>
  );
}
