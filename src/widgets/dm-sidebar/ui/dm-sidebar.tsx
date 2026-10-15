'use client';

import { useState } from 'react';

import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { NewDmModal } from '@/features/dm-open/ui/new-dm-modal';
import { JoinTeamModal } from '@/features/team-join/ui/join-team-modal';
import { dmQueries } from '@/entities/dm/api/dm-queries';
import { DmListItem } from '@/entities/dm/ui/dm-list-item';
import { userQueries } from '@/entities/user/api/user-queries';
import { cn } from '@/shared/lib/cn';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { dmPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';
import { GlobeIcon } from '@/shared/ui/icons/globe-icon';
import { PlusIcon } from '@/shared/ui/icons/plus-icon';
import { SearchIcon } from '@/shared/ui/icons/search-icon';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface DmSidebarProps {
  className?: string;
}

function DmSidebarError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="대화를 불러오지 못했습니다"
      action={
        <Button size="S" variant="weak" onClick={resetErrorBoundary}>
          다시 시도
        </Button>
      }
    />
  );
}

const DM_LIST_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 5 }, (_, index) => (
      <li key={index}>
        <span className="block h-13 animate-pulse rounded-xl bg-surface-container" />
      </li>
    ))}
  </ul>
);

export function DmSidebar({ className }: DmSidebarProps) {
  const { channelId: currentChannelId } = useRouteIds();
  const [newDmOpen, setNewDmOpen] = useState(false);
  const [joinTeamOpen, setJoinTeamOpen] = useState(false);

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex h-12 shrink-0 items-center px-2">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setNewDmOpen(true)}
          className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg bg-surface-container px-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <SearchIcon size={16} className="shrink-0" />
          <span className="truncate typography-subtext-small">
            대화 찾기 또는 시작하기
          </span>
        </button>
      </div>

      <div className="px-2 pb-2">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setJoinTeamOpen(true)}
          className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <GlobeIcon size={16} className="shrink-0" />
          <span className="truncate typography-subtext-small">
            초대 코드로 참여하기
          </span>
        </button>
      </div>

      <div className="flex h-8 shrink-0 items-center gap-2 px-4">
        <h2 className="min-w-0 flex-1 truncate typography-subtext-small text-on-surface-variant">
          다이렉트 메시지
        </h2>
        <button
          type="button"
          aria-label="새 메시지"
          aria-haspopup="dialog"
          onClick={() => setNewDmOpen(true)}
          className="shrink-0 cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <PlusIcon size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <QueryBoundary
          loadingFallback={DM_LIST_SKELETON}
          errorFallback={DmSidebarError}
        >
          <DmList
            currentChannelId={currentChannelId}
            onStartDm={() => setNewDmOpen(true)}
          />
        </QueryBoundary>
      </div>

      <NewDmModal open={newDmOpen} onClose={() => setNewDmOpen(false)} />
      <JoinTeamModal
        open={joinTeamOpen}
        onClose={() => setJoinTeamOpen(false)}
      />
    </div>
  );
}

interface DmListProps {
  currentChannelId: number | null;
  onStartDm: () => void;
}

function DmList({ currentChannelId, onStartDm }: DmListProps) {
  const { data: conversations } = useSuspenseQuery(dmQueries.list());

  const users = useQueries({
    queries: conversations.map((conversation) => ({
      ...userQueries.detail(conversation.otherUserId ?? 0),
      enabled: conversation.otherUserId !== null,
    })),
  });

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<ChatIcon />}
        title="대화가 없습니다"
        description="사용자를 찾아 메시지를 보내보세요"
        action={
          <Button size="S" onClick={onStartDm}>
            메시지 보내기
          </Button>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {conversations.map((conversation, index) => (
        <li key={conversation.channelId}>
          <DmListItem
            href={dmPath(conversation.channelId)}
            user={users[index]?.data}
            preview={conversation.lastMessage?.content}
            unreadCount={conversation.unreadCount}
            active={conversation.channelId === currentChannelId}
          />
        </li>
      ))}
    </ul>
  );
}
