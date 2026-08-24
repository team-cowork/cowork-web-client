import { type ReactNode } from 'react';

import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

export interface ChannelListItemProps {
  name: string;
  prefix?: ReactNode;
  unreadCount?: number;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ChannelListItem({
  name,
  prefix = '#',
  unreadCount,
  active,
  href,
  onClick,
  action,
  className,
}: ChannelListItemProps) {
  const linkContent = (
    <>
      <span className="shrink-0 text-on-surface-variant">{prefix}</span>
      <span className="flex-1 truncate typography-label-small">{name}</span>
    </>
  );

  const linkClassName =
    'flex h-full min-w-0 flex-1 cursor-pointer items-center gap-3 text-left';

  return (
    <div
      className={cn(
        'group flex h-[52px] w-full items-center gap-1 rounded-xl py-1 pr-2 pl-3 transition-colors',
        active
          ? 'bg-surface-container text-on-surface'
          : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface',
        className,
      )}
    >
      {href ? (
        <Link
          href={href}
          onClick={onClick}
          draggable={false}
          aria-current={active ? 'page' : undefined}
          className={linkClassName}
        >
          {linkContent}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          aria-current={active ? 'true' : undefined}
          className={linkClassName}
        >
          {linkContent}
        </button>
      )}

      {unreadCount != null && unreadCount > 0 && (
        <span className="inline-flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-full bg-primary px-[7px] typography-subtext-small text-on-primary">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {action && (
        <span className="shrink-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          {action}
        </span>
      )}
    </div>
  );
}
