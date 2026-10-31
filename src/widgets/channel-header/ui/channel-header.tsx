'use client';

import { type ReactNode } from 'react';

import Link from 'next/link';

import { type Channel } from '@/entities/channel/model/channel';
import { ChannelIcon } from '@/entities/channel/ui/channel-icon';
import { cn } from '@/shared/lib/cn';
import { channelSettingsOverviewPath } from '@/shared/model/paths';
import { LockIcon } from '@/shared/ui/icons/lock-icon';
import { PinIcon } from '@/shared/ui/icons/pin-icon';
import { SearchIcon } from '@/shared/ui/icons/search-icon';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import { UsersIcon } from '@/shared/ui/icons/users-icon';

export interface ChannelHeaderProps {
  teamId: number;
  channel: Channel;
  meta?: ReactNode;
  onToggleMembers?: () => void;
  /** 없으면 고정 메시지 버튼을 숨긴다(예: 음성 채널) */
  onTogglePins?: () => void;
  /** 없으면 검색 버튼을 비활성화한다 */
  onToggleSearch?: () => void;
  className?: string;
}

export function ChannelHeader({
  teamId,
  channel,
  meta,
  onToggleMembers,
  onTogglePins,
  onToggleSearch,
  className,
}: ChannelHeaderProps) {
  return (
    <header
      className={cn('flex h-12 shrink-0 items-center gap-2 px-4', className)}
    >
      <ChannelIcon
        viewType={channel.viewType}
        size={22}
        className="shrink-0 text-on-surface-variant"
      />
      <h1 className="shrink-0 typography-label-small text-on-surface">
        {channel.name}
      </h1>
      {channel.isPrivate && (
        <LockIcon
          size={14}
          className="shrink-0 text-on-surface-variant"
          aria-label="비공개 채널"
        />
      )}

      {channel.description && (
        <>
          <span aria-hidden className="h-5 w-px shrink-0 bg-outline-variant" />
          <p className="min-w-0 truncate typography-subtext-medium text-on-surface-variant">
            {channel.description}
          </p>
        </>
      )}

      {meta}

      <div className="ml-auto flex shrink-0 items-center gap-4 pl-4">
        <button
          type="button"
          aria-label="메시지 검색"
          disabled={!onToggleSearch}
          onClick={onToggleSearch}
          className="cursor-pointer text-on-surface-variant hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SearchIcon size={20} />
        </button>
        {onTogglePins && (
          <button
            type="button"
            aria-label="고정된 메시지"
            onClick={onTogglePins}
            className="cursor-pointer text-on-surface-variant hover:text-on-surface"
          >
            <PinIcon size={20} />
          </button>
        )}
        <button
          type="button"
          aria-label="멤버 목록"
          onClick={onToggleMembers}
          className="cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <UsersIcon size={20} />
        </button>
        <Link
          href={channelSettingsOverviewPath(teamId, channel.id)}
          aria-label="채널 설정"
          className="text-on-surface-variant hover:text-on-surface"
        >
          <SettingsIcon size={20} />
        </Link>
      </div>
    </header>
  );
}
