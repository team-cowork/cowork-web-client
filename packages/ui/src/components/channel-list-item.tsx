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
        'flex h-11 w-full items-center gap-2 rounded-lg px-3 text-left transition-colors',
        active
          ? 'bg-surface-variant text-on-surface'
          : 'text-on-surface-variant hover:bg-surface-variant/60 hover:text-on-surface',
        className,
      )}
    >
      <span className="shrink-0 text-on-surface-variant">{prefix}</span>
      <span className="typography-label-small flex-1 truncate">{name}</span>
      {unreadCount != null && unreadCount > 0 && (
        <span className="typography-subtext-small inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-on-primary">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
