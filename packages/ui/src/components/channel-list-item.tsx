import { type ReactNode } from 'react';

import { cn } from '../lib/cn';

export interface ChannelListItemProps {
  name: string;
  prefix?: ReactNode;
  unreadCount?: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ChannelListItem({
  name,
  prefix = '#',
  unreadCount,
  active,
  onClick,
  className,
}: ChannelListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left transition-colors',
        active
          ? 'bg-surface-variant text-on-surface'
          : 'text-on-surface-variant hover:bg-surface-variant/60 hover:text-on-surface',
        className,
      )}
    >
      <span className="text-on-surface-variant shrink-0">{prefix}</span>
      <span className="typography-label-small flex-1 truncate">{name}</span>
      {unreadCount != null && unreadCount > 0 && (
        <span className="typography-subtext-small bg-primary text-on-primary inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
