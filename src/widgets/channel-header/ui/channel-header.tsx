'use client';

import { type Channel } from '@/entities/channel/model/channel';
import { ChannelIcon } from '@/entities/channel/ui/channel-icon';
import { cn } from '@/shared/lib/cn';
import { LockIcon } from '@/shared/ui/icons/lock-icon';
import { MoreIcon } from '@/shared/ui/icons/more-icon';
import { SearchIcon } from '@/shared/ui/icons/search-icon';
import { UsersIcon } from '@/shared/ui/icons/users-icon';

export interface ChannelHeaderProps {
  channel: Channel;
  onToggleMembers?: () => void;
  className?: string;
}

export function ChannelHeader({ channel, onToggleMembers, className }: ChannelHeaderProps) {
  return (
    <header className={cn('flex h-12 shrink-0 items-center gap-2 px-4', className)}>
      <ChannelIcon
        viewType={channel.viewType}
        size={22}
        className="text-on-surface-variant shrink-0"
      />
      <h1 className="typography-label-small text-on-surface shrink-0">{channel.name}</h1>
      {channel.isPrivate && (
        <LockIcon size={14} className="text-on-surface-variant shrink-0" aria-label="비공개 채널" />
      )}

      {channel.description && (
        <>
          <span aria-hidden className="bg-outline-variant h-5 w-px shrink-0" />
          <p className="typography-subtext-medium text-on-surface-variant min-w-0 flex-1 truncate">
            {channel.description}
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
          aria-label="멤버 목록"
          onClick={onToggleMembers}
          className="text-on-surface-variant hover:text-on-surface cursor-pointer"
        >
          <UsersIcon size={20} />
        </button>
        <button
          type="button"
          aria-label="채널 설정"
          disabled
          className="text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreIcon size={20} />
        </button>
      </div>
    </header>
  );
}
