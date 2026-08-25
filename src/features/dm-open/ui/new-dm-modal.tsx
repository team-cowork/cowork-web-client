'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';

import { useOpenDm } from '@/features/dm-open/model/use-open-dm';
import { userQueries } from '@/entities/user/api/user-queries';
import { type SearchUsersParams, type User } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { dmPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { UsersIcon } from '@/shared/ui/icons/users-icon';
import { Modal } from '@/shared/ui/modal';
import { TextField } from '@/shared/ui/text-field';

const SEARCH_PAGE_SIZE = 20;

const USER_LIST_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 6 }, (_, index) => (
      <li key={index}>
        <span className="block h-13 animate-pulse rounded-xl bg-surface-container" />
      </li>
    ))}
  </ul>
);

function dedupeById(users: User[]): User[] {
  return [...new Map(users.map((user) => [user.id, user])).values()];
}

export interface NewDmModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewDmModal({ open, onClose }: NewDmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="메시지 보내기"
      className="w-[520px]"
    >
      {open ? <NewDmForm onClose={onClose} /> : undefined}
    </Modal>
  );
}

function NewDmForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword.trim());
  const openDm = useOpenDm();

  const { data: me } = useQuery(userQueries.me());
  const searchParams: SearchUsersParams[] = debouncedKeyword
    ? [
        { name: debouncedKeyword, page_size: SEARCH_PAGE_SIZE },
        { nickname: debouncedKeyword, page_size: SEARCH_PAGE_SIZE },
      ]
    : [{ page_size: SEARCH_PAGE_SIZE }];

  const results = useQueries({
    queries: searchParams.map((params) => ({
      ...userQueries.search(params),
      placeholderData: keepPreviousData,
    })),
  });

  const isPending = results.some((result) => result.isPending);
  const isError = results.every((result) => result.isError);
  const candidates = dedupeById(
    results.flatMap((result) => result.data?.items ?? []),
  ).filter((user) => user.id !== me?.id);

  const handleSelect = (user: User) => {
    if (openDm.isPending) return;

    openDm.mutate(
      { targetUserId: user.id },
      {
        onSuccess: (channel) => {
          onClose();
          router.push(dmPath(channel.id));
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="사용자 검색"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="이름으로 검색하세요"
        maxLength={50}
        autoFocus
      />

      {openDm.isError && (
        <ErrorState
          title="대화를 열지 못했습니다"
          description="잠시 후 다시 시도해 주세요"
        />
      )}

      <div className="h-80 overflow-y-auto">
        {isPending ? (
          USER_LIST_SKELETON
        ) : isError ? (
          <ErrorState
            title="사용자를 불러오지 못했습니다"
            action={
              <Button
                size="S"
                variant="weak"
                onClick={() => results.forEach((result) => result.refetch())}
              >
                다시 시도
              </Button>
            }
          />
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title={
              debouncedKeyword
                ? '검색 결과가 없습니다'
                : '표시할 사용자가 없습니다'
            }
            description={
              debouncedKeyword ? '다른 이름으로 검색해 보세요' : undefined
            }
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {candidates.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  disabled={openDm.isPending}
                  onClick={() => handleSelect(user)}
                  className="flex h-13 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserAvatar
                    user={user}
                    size={32}
                    ringClassName="ring-surface"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate typography-label-small text-on-surface">
                      {user.nickname ?? user.name}
                    </span>
                    <span className="truncate typography-subtext-small text-on-surface-variant">
                      {user.email}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
