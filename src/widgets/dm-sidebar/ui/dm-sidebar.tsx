'use client';

import { useState } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import { NewDmModal } from '@/features/dm-open/ui/new-dm-modal';
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
import { PlusIcon } from '@/shared/ui/icons/plus-icon';
import { SearchIcon } from '@/shared/ui/icons/search-icon';

export interface DmSidebarProps {
  className?: string;
}

export function DmSidebar({ className }: DmSidebarProps) {
  const { channelId } = useRouteIds();
  const [newDmOpen, setNewDmOpen] = useState(false);
  const { data: conversations, isPending, isError, refetch } = useQuery(dmQueries.list());

  const users = useQueries({
    queries: (conversations ?? []).map((conversation) =>
      userQueries.detail(conversation.targetUserId),
    ),
  });

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex h-12 shrink-0 items-center px-2">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setNewDmOpen(true)}
          className="bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 transition-colors"
        >
          <SearchIcon size={16} className="shrink-0" />
          <span className="typography-subtext-small truncate">대화 찾기 또는 시작하기</span>
        </button>
      </div>

      <div className="flex h-8 shrink-0 items-center gap-2 px-4">
        <h2 className="typography-subtext-small text-on-surface-variant min-w-0 flex-1 truncate">
          다이렉트 메시지
        </h2>
        <button
          type="button"
          aria-label="새 메시지"
          aria-haspopup="dialog"
          onClick={() => setNewDmOpen(true)}
          className="text-on-surface-variant hover:text-on-surface shrink-0 cursor-pointer"
        >
          <PlusIcon size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
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
            title="대화를 불러오지 못했습니다"
            action={
              <Button size="S" variant="weak" onClick={() => refetch()}>
                다시 시도
              </Button>
            }
          />
        )}

        {conversations?.length === 0 && (
          <EmptyState
            icon={<ChatIcon />}
            title="대화가 없습니다"
            description="사용자를 찾아 메시지를 보내보세요"
            action={
              <Button size="S" onClick={() => setNewDmOpen(true)}>
                메시지 보내기
              </Button>
            }
          />
        )}

        <ul className="flex flex-col gap-1">
          {conversations?.map((conversation, index) => (
            <li key={conversation.channelId}>
              <DmListItem
                href={dmPath(conversation.channelId)}
                user={users[index]?.data}
                preview={conversation.lastMessage?.content}
                unreadCount={conversation.unreadCount}
                active={conversation.channelId === channelId}
              />
            </li>
          ))}
        </ul>
      </div>

      <NewDmModal open={newDmOpen} onClose={() => setNewDmOpen(false)} />
    </div>
  );
}
