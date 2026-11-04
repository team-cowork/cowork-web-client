'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { UserStatusPopover } from '@/features/user-status/ui/user-status-popover';
import { userQueries } from '@/entities/user/api/user-queries';
import { USER_STATUS_LABEL, type UserStatus } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { cn } from '@/shared/lib/cn';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import { Modal } from '@/shared/ui/modal';

export interface UserFooterProps {
  /** 프로필 모달 내용. 편집을 누르면 onEdit으로 설정 모달로 넘어가요. */
  renderProfile: (onEdit: () => void) => ReactNode;
  /** 설정 모달 내용 */
  settings: ReactNode;
  className?: string;
}

export function UserFooter({
  renderProfile,
  settings,
  className,
}: UserFooterProps) {
  const { data: user } = useQuery(userQueries.me());
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const statusLabel = user
    ? (USER_STATUS_LABEL[user.status as UserStatus] ?? user.status)
    : '';

  const handleEdit = () => {
    setProfileOpen(false);
    setSettingsOpen(true);
  };

  return (
    <div className={cn('relative', className)}>
      {open && user && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-2 z-50 mb-2">
            <UserStatusPopover
              user={user}
              onAvatarClick={() => {
                setOpen(false);
                setProfileOpen(true);
              }}
            />
          </div>
        </>
      )}
      <div className="flex h-14 w-full items-center gap-2 bg-surface-container px-2">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((prev) => !prev)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-surface-container-high"
        >
          <UserAvatar
            user={user}
            size={32}
            ringClassName="ring-surface-container"
            loading="eager"
          />
          <span className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="truncate text-[0.875rem] font-semibold text-on-surface">
              {user?.name ?? ''}
            </span>
            <span className="truncate text-[0.75rem] text-on-surface-variant">
              {statusLabel}
            </span>
          </span>
        </button>
        <button
          type="button"
          aria-label="설정"
          onClick={() => setSettingsOpen(true)}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-surface-container-high"
        >
          <SettingsIcon size={20} className="text-on-surface-variant" />
        </button>
      </div>

      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="프로필"
        className="w-[800px]"
      >
        {renderProfile(handleEdit)}
      </Modal>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="설정 · 프로필"
        className="w-[760px]"
      >
        {settings}
      </Modal>
    </div>
  );
}
