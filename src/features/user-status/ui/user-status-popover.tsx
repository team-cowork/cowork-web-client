'use client';

import { type SyntheticEvent, useState } from 'react';

import { useUpdateStatus } from '@/features/user-status/model/use-update-status';
import {
  USER_STATUS_DOT_CLASS,
  USER_STATUS_LABEL,
  USER_STATUSES,
  toUserStatus,
  type User,
  type UserStatus,
} from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/ui/icons/check-icon';

export interface UserStatusPopoverProps {
  user: User;
  className?: string;
}

export function UserStatusPopover({ user, className }: UserStatusPopoverProps) {
  const currentStatus = toUserStatus(user.status);
  const [message, setMessage] = useState(user.status_message ?? '');
  const updateStatus = useUpdateStatus();

  const handleSelect = (status: UserStatus) => {
    if (status === currentStatus) return;
    updateStatus.mutate({ status, message: message || null });
  };

  const handleSubmitMessage = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!currentStatus) return;
    updateStatus.mutate({ status: currentStatus, message: message || null });
  };

  return (
    <div
      className={cn(
        'w-[280px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low shadow-lg',
        className,
      )}
    >
      <div className="h-14 bg-gradient-to-r from-cowork-red-500 to-cowork-blue-500" />
      <div className="flex flex-col gap-3 px-3 pt-0 pb-3">
        <span className="-mt-7 w-fit rounded-full bg-surface-container-low p-1">
          <UserAvatar
            user={user}
            size={56}
            ringClassName="ring-surface-container-low"
            loading="eager"
          />
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-[1rem] font-bold text-on-surface">
            {user.name}
          </p>
          {user.nickname && (
            <p className="truncate text-[0.8125rem] text-on-surface-variant">
              @{user.nickname}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmitMessage}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="무슨 생각 중이세요?"
            aria-label="상태 메시지"
            disabled={!currentStatus}
            className="h-9 w-full rounded-lg bg-surface-container px-3 text-[0.8125rem] text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:opacity-50"
          />
        </form>
      </div>
      <div className="h-px bg-outline-variant" />
      <div className="flex flex-col p-1.5">
        {USER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => handleSelect(status)}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[0.9375rem] text-on-surface hover:bg-surface-container"
          >
            <span
              className={cn(
                'size-2.5 shrink-0 rounded-full',
                USER_STATUS_DOT_CLASS[status],
              )}
            />
            <span className="flex-1 truncate">{USER_STATUS_LABEL[status]}</span>
            {status === currentStatus && (
              <CheckIcon
                size={16}
                className="shrink-0 text-on-surface-variant"
              />
            )}
          </button>
        ))}
      </div>
      <p className="h-5 px-3 pb-2 text-[0.8125rem] text-error" role="alert">
        {updateStatus.isError ? '상태를 바꾸지 못했어요.' : ''}
      </p>
    </div>
  );
}
