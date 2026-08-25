'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { ChannelIcon } from '@/entities/channel/ui/channel-icon';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { channelPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';
import { LockIcon } from '@/shared/ui/icons/lock-icon';
import { Modal } from '@/shared/ui/modal';
import { TextField } from '@/shared/ui/text-field';

const CHANNEL_LIST_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 6 }, (_, index) => (
      <li key={index}>
        <span className="block h-13 animate-pulse rounded-xl bg-surface-container" />
      </li>
    ))}
  </ul>
);

export interface ChannelSearchModalProps {
  open: boolean;
  teamId: number;
  onClose: () => void;
}

export function ChannelSearchModal({
  open,
  teamId,
  onClose,
}: ChannelSearchModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="채널 찾기"
      className="w-[520px]"
    >
      {open ? (
        <ChannelSearchForm teamId={teamId} onClose={onClose} />
      ) : undefined}
    </Modal>
  );
}

function ChannelSearchForm({
  teamId,
  onClose,
}: {
  teamId: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword.trim());

  const {
    data: channels,
    isPending,
    isError,
    refetch,
  } = useQuery({
    ...channelQueries.search({ teamId, q: debouncedKeyword }),
    enabled: debouncedKeyword.length > 0,
    placeholderData: keepPreviousData,
  });

  const handleSelect = (channelId: number) => {
    onClose();
    router.push(channelPath(teamId, channelId));
  };

  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="채널 검색"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="채널 이름으로 검색하세요"
        maxLength={50}
        autoFocus
      />

      <div className="h-80 overflow-y-auto">
        {debouncedKeyword.length === 0 ? (
          <EmptyState
            icon={<ChatIcon />}
            title="채널을 검색해 보세요"
            description="채널 이름 일부를 입력하면 결과가 표시됩니다"
          />
        ) : isPending ? (
          CHANNEL_LIST_SKELETON
        ) : isError ? (
          <ErrorState
            title="채널을 불러오지 못했습니다"
            action={
              <Button size="S" variant="weak" onClick={() => refetch()}>
                다시 시도
              </Button>
            }
          />
        ) : channels.length === 0 ? (
          <EmptyState
            icon={<ChatIcon />}
            title="검색 결과가 없습니다"
            description="다른 이름으로 검색해 보세요"
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {channels.map((channel) => (
              <li key={channel.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(channel.id)}
                  className="flex h-13 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-surface-container"
                >
                  <ChannelIcon
                    viewType={channel.viewType}
                    size={18}
                    className="shrink-0 text-on-surface-variant"
                  />
                  <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
                    {channel.name}
                  </span>
                  {channel.isPrivate && (
                    <LockIcon
                      size={14}
                      className="shrink-0 text-on-surface-variant"
                      aria-label="비공개 채널"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
