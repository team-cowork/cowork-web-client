'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { CreateChannelModal } from '@/features/channel-create/ui/create-channel-modal';
import { channelQueries } from '@/entities/channel/api/channel-queries';
import { teamQueries } from '@/entities/team/api/team-queries';
import { groupChannelsByProject } from '@/widgets/channel-sidebar/lib/group-channels-by-project';
import { ChannelGroup } from '@/widgets/channel-sidebar/ui/channel-group';
import { cn } from '@/shared/lib/cn';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';
import { ChevronDownIcon } from '@/shared/ui/icons/chevron-down-icon';

export interface ChannelSidebarProps {
  teamId: number;
  className?: string;
}

export function ChannelSidebar({ teamId, className }: ChannelSidebarProps) {
  const { channelId: currentChannelId } = useRouteIds();
  const { data: team } = useQuery(teamQueries.detail(teamId));
  const { data: channels, isPending, isError, refetch } = useQuery(channelQueries.byTeam(teamId));
  const [createOpen, setCreateOpen] = useState(false);

  const groups = channels ? groupChannelsByProject(channels) : [];

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <h2 className="typography-label-small text-on-surface min-w-0 flex-1 truncate">
          {team?.name ?? ''}
        </h2>
        <ChevronDownIcon size={18} className="text-on-surface-variant shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {isPending && (
          <ul className="flex flex-col gap-1">
            {Array.from({ length: 5 }, (_, index) => (
              <li key={index}>
                <span className="bg-surface-container block h-13 animate-pulse rounded-xl" />
              </li>
            ))}
          </ul>
        )}

        {isError && (
          <ErrorState
            title="채널을 불러오지 못했습니다"
            action={
              <Button size="S" variant="weak" onClick={() => refetch()}>
                다시 시도
              </Button>
            }
          />
        )}

        {channels?.length === 0 && (
          <EmptyState
            icon={<ChatIcon />}
            title="채널이 없습니다"
            description="채널을 만들어 대화를 시작하세요"
            action={
              <Button size="S" onClick={() => setCreateOpen(true)}>
                채널 만들기
              </Button>
            }
          />
        )}

        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <ChannelGroup
              key={group.projectId ?? 'none'}
              teamId={teamId}
              projectId={group.projectId}
              channels={group.channels}
              activeChannelId={currentChannelId}
              onCreateChannel={() => setCreateOpen(true)}
            />
          ))}
        </div>
      </div>

      <CreateChannelModal
        open={createOpen}
        teamId={teamId}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
