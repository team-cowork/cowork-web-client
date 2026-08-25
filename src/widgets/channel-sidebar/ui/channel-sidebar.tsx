'use client';

import { useState } from 'react';

import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { buildReorderedChannelIds } from '@/features/channel-reorder/lib/reorder-channels';
import { useReorderChannels } from '@/features/channel-reorder/model/use-reorder-channels';
import { ChannelSearchModal } from '@/features/channel-search/ui/channel-search-modal';
import { CreateChannelModal } from '@/features/channel-create/ui/create-channel-modal';
import { InviteTeamMembersModal } from '@/features/team-members/ui/invite-team-members-modal';
import { channelQueries } from '@/entities/channel/api/channel-queries';
import { teamQueries } from '@/entities/team/api/team-queries';
import { groupChannelsByProject } from '@/widgets/channel-sidebar/lib/group-channels-by-project';
import { ChannelGroup } from '@/widgets/channel-sidebar/ui/channel-group';
import { TeamMenu } from '@/widgets/channel-sidebar/ui/team-menu';
import { cn } from '@/shared/lib/cn';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';
import { SearchIcon } from '@/shared/ui/icons/search-icon';
import { UserPlusIcon } from '@/shared/ui/icons/user-plus-icon';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface ChannelSidebarProps {
  teamId: number;
  className?: string;
}

function ChannelSidebarError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="채널을 불러오지 못했습니다"
      action={
        <Button size="S" variant="weak" onClick={resetErrorBoundary}>
          다시 시도
        </Button>
      }
    />
  );
}

const CHANNEL_LIST_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 5 }, (_, index) => (
      <li key={index}>
        <span className="block h-13 animate-pulse rounded-xl bg-surface-container" />
      </li>
    ))}
  </ul>
);

export function ChannelSidebar({ teamId, className }: ChannelSidebarProps) {
  const { channelId: currentChannelId } = useRouteIds();
  const { data: team } = useQuery(teamQueries.detail(teamId));
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <h2 className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
          {team?.name ?? ''}
        </h2>

        <button
          type="button"
          aria-label="채널 찾기"
          aria-haspopup="dialog"
          onClick={() => setSearchOpen(true)}
          className="shrink-0 cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <SearchIcon size={18} />
        </button>
        <button
          type="button"
          aria-label="팀원 초대"
          aria-haspopup="dialog"
          onClick={() => setInviteOpen(true)}
          className="shrink-0 cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <UserPlusIcon size={18} />
        </button>
        <TeamMenu teamId={teamId} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <QueryBoundary
          loadingFallback={CHANNEL_LIST_SKELETON}
          errorFallback={ChannelSidebarError}
          resetKeys={[teamId]}
        >
          <ChannelList
            teamId={teamId}
            currentChannelId={currentChannelId}
            onCreateChannel={() => setCreateOpen(true)}
          />
        </QueryBoundary>
      </div>

      <CreateChannelModal
        open={createOpen}
        teamId={teamId}
        onClose={() => setCreateOpen(false)}
      />
      <InviteTeamMembersModal
        open={inviteOpen}
        teamId={teamId}
        onClose={() => setInviteOpen(false)}
      />
      <ChannelSearchModal
        open={searchOpen}
        teamId={teamId}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

interface ChannelListProps {
  teamId: number;
  currentChannelId: number | null;
  onCreateChannel: () => void;
}

function ChannelList({
  teamId,
  currentChannelId,
  onCreateChannel,
}: ChannelListProps) {
  const { data: channels } = useSuspenseQuery(channelQueries.byTeam(teamId));
  const groups = groupChannelsByProject(channels);
  const reorderChannels = useReorderChannels(teamId);

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (!destination) return;
    if (destination.droppableId !== source.droppableId) return;
    if (destination.index === source.index) return;

    const orderedChannelIds = buildReorderedChannelIds(
      groups,
      source.droppableId,
      source.index,
      destination.index,
    );
    if (!orderedChannelIds) return;

    reorderChannels.mutate(orderedChannelIds);
  };

  return (
    <>
      {channels.length === 0 && (
        <EmptyState
          icon={<ChatIcon />}
          title="채널이 없습니다"
          description="채널을 만들어 대화를 시작하세요"
          action={
            <Button size="S" onClick={onCreateChannel}>
              채널 만들기
            </Button>
          }
        />
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <ChannelGroup
              key={group.projectId ?? 'none'}
              teamId={teamId}
              projectId={group.projectId}
              channels={group.channels}
              activeChannelId={currentChannelId}
              onCreateChannel={onCreateChannel}
            />
          ))}
        </div>
      </DragDropContext>
    </>
  );
}
