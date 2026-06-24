import { type ReactNode } from 'react';

import { Avatar } from './avatar';
import { cn } from '../lib/cn';

export interface MessageItemProps {
  author: string;
  timestamp: string;
  content: ReactNode;
  avatarSrc?: string;
  className?: string;
}

export function MessageItem({ author, timestamp, content, avatarSrc, className }: MessageItemProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      <Avatar src={avatarSrc} name={author} size={40} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="typography-label-small text-on-surface">{author}</span>
          <span className="typography-subtext-small text-on-surface-variant">{timestamp}</span>
        </div>
        <div className="typography-body-medium mt-0.5 break-words text-on-surface">{content}</div>
      </div>
    </div>
  );
}
