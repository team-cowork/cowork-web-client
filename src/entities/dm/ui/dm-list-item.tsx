import Link from 'next/link';

import { type User } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { cn } from '@/shared/lib/cn';

export interface DmListItemProps {
  href: string;
  user?: User;
  fallbackName?: string;
  preview?: string;
  unreadCount?: number;
  active?: boolean;
  className?: string;
}

export function DmListItem({
  href,
  user,
  fallbackName = '알 수 없는 사용자',
  preview,
  unreadCount,
  active,
  className,
}: DmListItemProps) {
  const name = user ? (user.nickname ?? user.name) : fallbackName;
  const hasUnread = unreadCount != null && unreadCount > 0;

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-[52px] w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-colors',
        active
          ? 'bg-surface-container text-on-surface'
          : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface',
        className,
      )}
    >
      <UserAvatar user={user} size={32} ringClassName="ring-surface" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            'truncate typography-label-small',
            hasUnread && !active && 'text-on-surface',
          )}
        >
          {name}
        </span>
        {preview && (
          <span className="truncate typography-subtext-small text-on-surface-variant">
            {preview}
          </span>
        )}
      </span>
      {hasUnread && (
        <span className="inline-flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-full bg-primary px-[7px] typography-subtext-small text-on-primary">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
