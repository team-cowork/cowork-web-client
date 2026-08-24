'use client';

import { useState } from 'react';

import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';

import { useCreateTeamInvite } from '@/features/team-invite/model/use-create-team-invite';
import { useInviteTeamMembers } from '@/features/team-members/model/use-invite-team-members';
import { teamQueries } from '@/entities/team/api/team-queries';
import {
  INVITE_DURATIONS,
  INVITE_DURATION_LABEL,
  type InviteDuration,
} from '@/entities/team/model/team';
import { type SearchUsersParams, type User } from '@/entities/user/model/user';
import { userQueries } from '@/entities/user/api/user-queries';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { CopyIcon } from '@/shared/ui/icons/copy-icon';
import { UsersIcon } from '@/shared/ui/icons/users-icon';
import { Modal } from '@/shared/ui/modal';
import { SegmentedControl } from '@/shared/ui/segmented-control';
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

export interface InviteTeamMembersModalProps {
  open: boolean;
  teamId: number;
  onClose: () => void;
}

export function InviteTeamMembersModal({
  open,
  teamId,
  onClose,
}: InviteTeamMembersModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="팀원 초대"
      className="max-h-[85vh] w-[520px] overflow-y-auto"
    >
      {open ? (
        <InviteTeamMembersForm teamId={teamId} onClose={onClose} />
      ) : undefined}
    </Modal>
  );
}

function InviteTeamMembersForm({
  teamId,
  onClose,
}: {
  teamId: number;
  onClose: () => void;
}) {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword.trim());
  const [selected, setSelected] = useState<User[]>([]);
  const inviteTeamMembers = useInviteTeamMembers(teamId);

  const { data: members } = useQuery(teamQueries.members(teamId));
  const existingMemberIds = new Set(
    (members ?? []).map((member) => member.userId),
  );

  const searchParams: SearchUsersParams[] = debouncedKeyword
    ? [
        { name: debouncedKeyword, page_size: SEARCH_PAGE_SIZE },
        { nickname: debouncedKeyword, page_size: SEARCH_PAGE_SIZE },
      ]
    : [];

  const results = useQueries({
    queries: searchParams.map((params) => ({
      ...userQueries.search(params),
      placeholderData: keepPreviousData,
    })),
  });

  const isPending =
    debouncedKeyword.length > 0 && results.some((r) => r.isPending);
  const isError =
    debouncedKeyword.length > 0 && results.every((r) => r.isError);
  const selectedIds = new Set(selected.map((user) => user.id));
  const candidates = dedupeById(
    results.flatMap((result) => result.data?.items ?? []),
  ).filter(
    (user) => !existingMemberIds.has(user.id) && !selectedIds.has(user.id),
  );

  const toggleSelect = (user: User) => {
    setSelected((prev) => [...prev, user]);
    setKeyword('');
  };

  const removeSelected = (userId: number) => {
    setSelected((prev) => prev.filter((user) => user.id !== userId));
  };

  const canSubmit = selected.length > 0 && !inviteTeamMembers.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    inviteTeamMembers.mutate(
      selected.map((user) => user.id),
      { onSuccess: onClose },
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

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => removeSelected(user.id)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-surface-container py-1 pr-2 pl-1 text-on-surface hover:bg-surface-container-high"
              >
                <UserAvatar user={user} size={20} />
                <span className="typography-subtext-medium">
                  {user.nickname ?? user.name}
                </span>
                <CloseIcon size={14} className="text-on-surface-variant" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {inviteTeamMembers.isError && (
        <ErrorState
          title="팀원을 초대하지 못했습니다"
          description="잠시 후 다시 시도해 주세요"
        />
      )}

      <div className="h-72 overflow-y-auto">
        {debouncedKeyword.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title="초대할 사용자를 검색해 보세요"
            description="이름으로 검색하면 결과가 표시됩니다"
          />
        ) : isPending ? (
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
            title="검색 결과가 없습니다"
            description="다른 이름으로 검색해 보세요"
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {candidates.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => toggleSelect(user)}
                  className="flex h-13 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-surface-container"
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

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={inviteTeamMembers.isPending}
          onClick={onClose}
        >
          취소
        </Button>
        <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
          {inviteTeamMembers.isPending
            ? '초대하는 중…'
            : selected.length > 0
              ? `${selected.length}명 초대`
              : '초대'}
        </Button>
      </div>

      <InviteLinkSection teamId={teamId} />
    </div>
  );
}

function InviteLinkSection({ teamId }: { teamId: number }) {
  const [duration, setDuration] = useState<InviteDuration>('7d');
  const [copied, setCopied] = useState(false);
  const createInvite = useCreateTeamInvite(teamId);

  const handleCopy = async () => {
    if (!createInvite.data) return;

    await navigator.clipboard.writeText(createInvite.data.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2.5 border-t border-outline-variant pt-4">
      <h3 className="typography-label-x-small text-on-surface-variant">
        초대 링크로 초대
      </h3>

      {createInvite.data ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
              {createInvite.data.inviteCode}
            </span>
            <button
              type="button"
              aria-label="초대 코드 복사"
              onClick={handleCopy}
              className="flex shrink-0 cursor-pointer items-center gap-1 text-on-surface-variant hover:text-on-surface"
            >
              <CopyIcon size={16} />
              <span className="typography-subtext-medium">
                {copied ? '복사됨' : '복사'}
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => createInvite.reset()}
            className="w-fit cursor-pointer typography-subtext-medium text-on-surface-variant hover:text-on-surface"
          >
            새 링크 만들기
          </button>
        </div>
      ) : (
        <>
          <SegmentedControl
            options={INVITE_DURATIONS.map((value) => ({
              label: INVITE_DURATION_LABEL[value],
              value,
            }))}
            value={duration}
            onChange={setDuration}
          />
          <Button
            type="button"
            variant="weak"
            color="neutral"
            disabled={createInvite.isPending}
            onClick={() => createInvite.mutate(duration)}
          >
            {createInvite.isPending ? '생성하는 중…' : '링크 생성'}
          </Button>
        </>
      )}

      {createInvite.isError && (
        <p className="typography-subtext-medium text-error">
          링크를 생성하지 못했어요. 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
