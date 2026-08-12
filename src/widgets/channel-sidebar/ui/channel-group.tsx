'use client';

import { useState } from 'react';

import { type Channel } from '@/entities/channel/model/channel';
import { ChannelIcon } from '@/entities/channel/ui/channel-icon';
import { ChannelListItem } from '@/entities/channel/ui/channel-list-item';
import { channelPath } from '@/shared/model/paths';
import { ChevronDownIcon } from '@/shared/ui/icons/chevron-down-icon';
import { ChevronRightIcon } from '@/shared/ui/icons/chevron-right-icon';
import { PlusIcon } from '@/shared/ui/icons/plus-icon';

export interface ChannelGroupProps {
  teamId: number;
  projectId: number | null;
  channels: Channel[];
  activeChannelId: number | null;
  onCreateChannel?: () => void;
}

export function ChannelGroup({
  teamId,
  projectId,
  channels,
  activeChannelId,
  onCreateChannel,
}: ChannelGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const label = projectId === null ? '프로젝트 미소속' : `프로젝트 #${projectId}`;
  const canCreate = projectId === null && onCreateChannel !== undefined;

  return (
    <section className="flex flex-col">
      <div className="flex h-6 items-center gap-1 px-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="text-on-surface-variant hover:text-on-surface flex min-w-0 flex-1 cursor-pointer items-center gap-1"
        >
          {expanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
          <span className="typography-subtext-small truncate">{label}</span>
        </button>
        <button
          type="button"
          aria-label={`${label}에 채널 추가`}
          title={canCreate ? undefined : '채널을 프로젝트에 배정하는 API가 아직 없습니다'}
          disabled={!canCreate}
          onClick={onCreateChannel}
          className="text-on-surface-variant hover:text-on-surface shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon size={16} />
        </button>
      </div>

      {expanded && (
        <ul className="mt-0.5 flex flex-col gap-0.5">
          {channels.map((channel) => (
            <li key={channel.id}>
              <ChannelListItem
                name={channel.name}
                href={channelPath(teamId, channel.id)}
                active={channel.id === activeChannelId}
                prefix={<ChannelIcon viewType={channel.viewType} size={18} />}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
