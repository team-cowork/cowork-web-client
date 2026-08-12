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
  className?: string;
}

export function ChannelListItem({
  name,
  prefix = '#',
  unreadCount,
  active,
  href,
  onClick,
  className,
}: ChannelListItemProps) {
  const content = (
    <>
      <span className="text-on-surface-variant shrink-0">{prefix}</span>
      <span className="typography-label-small flex-1 truncate">{name}</span>
      {unreadCount != null && unreadCount > 0 && (
        <span className="typography-subtext-small bg-primary text-on-primary inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </>
  );

  const sharedClassName = cn(
    'flex h-[52px] w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-colors',
    active
      ? 'bg-surface-container text-on-surface'
      : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface',
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={sharedClassName}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={sharedClassName}
    >
      {content}
    </button>
  );
}
