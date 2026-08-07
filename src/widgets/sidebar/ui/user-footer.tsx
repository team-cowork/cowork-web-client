'use client';

import Link from 'next/link';

import { useEffect, useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { UserStatusPopover } from '@/features/user-status/ui/user-status-popover';
import { userQueries } from '@/entities/user/api/user-queries';
import { USER_STATUS_LABEL, type UserStatus } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { cn } from '@/shared/lib/cn';
import { SettingsIcon } from '@/shared/ui/icons';

export interface UserFooterProps {
  className?: string;
}

export function UserFooter({ className }: UserFooterProps) {
  const { data: user } = useQuery(userQueries.me());
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const statusLabel = user ? (USER_STATUS_LABEL[user.status as UserStatus] ?? user.status) : '';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {open && user && (
        <div className="absolute bottom-full left-2 z-50 mb-2">
          <UserStatusPopover user={user} />
        </div>
      )}
      <div className="bg-surface-container flex h-14 w-full items-center gap-2 px-2">
        <button
          type="button"
          disabled={!user}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((prev) => !prev)}
          className="hover:bg-surface-container-high flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-left disabled:cursor-default"
        >
          <UserAvatar user={user} size={32} ringClassName="ring-surface-container" />
          <span className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="text-on-surface truncate text-[0.875rem] font-semibold">
              {user?.name ?? ''}
            </span>
            <span className="text-on-surface-variant truncate text-[0.75rem]">{statusLabel}</span>
          </span>
        </button>
        <Link
          href="/profile"
          aria-label="내 프로필"
          className="hover:bg-surface-container-high flex size-9 shrink-0 items-center justify-center rounded-lg"
        >
          <SettingsIcon size={20} className="text-on-surface-variant" />
        </Link>
      </div>
    </div>
  );
}
