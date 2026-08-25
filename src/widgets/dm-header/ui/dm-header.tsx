'use client';

import {
  USER_STATUS_LABEL,
  toUserStatus,
  type User,
} from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { cn } from '@/shared/lib/cn';
import { MoreIcon } from '@/shared/ui/icons/more-icon';
import { SearchIcon } from '@/shared/ui/icons/search-icon';

export interface DmHeaderProps {
  user?: User;
  className?: string;
}

export function DmHeader({ user, className }: DmHeaderProps) {
  const status = user ? toUserStatus(user.status) : null;
  const subtitle =
    user?.status_message ?? (status ? USER_STATUS_LABEL[status] : null);

  return (
    <header
      className={cn('flex h-12 shrink-0 items-center gap-2 px-4', className)}
    >
      <UserAvatar user={user} size={24} ringClassName="ring-background" />
      <h1 className="shrink-0 typography-label-small text-on-surface">
        {user ? (user.nickname ?? user.name) : ''}
      </h1>

      {subtitle && (
        <>
          <span aria-hidden className="h-5 w-px shrink-0 bg-outline-variant" />
          <p className="min-w-0 flex-1 truncate typography-subtext-medium text-on-surface-variant">
            {subtitle}
          </p>
        </>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-4 pl-4">
        <button
          type="button"
          aria-label="메시지 검색"
          disabled
          className="text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SearchIcon size={20} />
        </button>
        <button
          type="button"
          aria-label="대화 설정"
          disabled
          className="text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreIcon size={20} />
        </button>
      </div>
    </header>
  );
}
