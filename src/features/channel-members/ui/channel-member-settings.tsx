'use client';

import { useState } from 'react';

import { useQueries, useSuspenseQuery } from '@tanstack/react-query';

import { useAddChannelMember } from '@/features/channel-members/model/use-add-channel-member';
import { useRemoveChannelMember } from '@/features/channel-members/model/use-remove-channel-member';
import { channelQueries } from '@/entities/channel/api/channel-queries';
import { type ChannelMember } from '@/entities/channel/model/channel';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type TeamMember } from '@/entities/team/model/team';
import { userQueries } from '@/entities/user/api/user-queries';
import { type User } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { UsersIcon } from '@/shared/ui/icons/users-icon';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';
import { TextField } from '@/shared/ui/text-field';

function memberDisplayName(userId: number, user: User | undefined): string {
  if (user) return user.nickname ?? user.name;
  return `사용자 #${userId}`;
}

const MEMBER_LIST_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 4 }, (_, index) => (
      <li key={index}>
        <span className="block h-13 animate-pulse rounded-xl bg-surface-container" />
      </li>
    ))}
  </ul>
);

export interface ChannelMemberSettingsProps {
  teamId: number;
  channelId: number;
}

function ChannelMemberSettingsError() {
  return (
    <ErrorState
      title="채널 멤버를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
    />
  );
}

export function ChannelMemberSettings({
  teamId,
  channelId,
}: ChannelMemberSettingsProps) {
  return (
    <SettingsCard title="멤버">
      <QueryBoundary
        loadingFallback={MEMBER_LIST_SKELETON}
        errorFallback={ChannelMemberSettingsError}
        resetKeys={[teamId, channelId]}
      >
        <ChannelMemberList teamId={teamId} channelId={channelId} />
      </QueryBoundary>
    </SettingsCard>
  );
}

function ChannelMemberList({
  teamId,
  channelId,
}: {
  teamId: number;
  channelId: number;
}) {
  const [keyword, setKeyword] = useState('');
  const { data: teamMembers } = useSuspenseQuery(teamQueries.members(teamId));
  const { data: channelMembers } = useSuspenseQuery(
    channelQueries.members(channelId),
  );

  const userResults = useQueries({
    queries: teamMembers.map((member) => userQueries.detail(member.userId)),
  });
  const usersByUserId = new Map(
    teamMembers.map((member, index) => [
      member.userId,
      userResults[index]?.data,
    ]),
  );

  const addMember = useAddChannelMember(channelId);
  const removeMember = useRemoveChannelMember(channelId);

  const channelMemberUserIds = new Set(
    channelMembers.map((member) => member.userId),
  );

  const trimmedKeyword = keyword.trim().toLowerCase();
  const isSearching = trimmedKeyword.length > 0;

  const candidates: TeamMember[] = isSearching
    ? teamMembers.filter((member) => {
        if (channelMemberUserIds.has(member.userId)) return false;
        const user = usersByUserId.get(member.userId);
        return memberDisplayName(member.userId, user)
          .toLowerCase()
          .includes(trimmedKeyword);
      })
    : [];

  return (
    <div className="flex flex-col gap-3.5">
      <TextField
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="이름으로 검색해서 채널에 추가"
      />

      {isSearching ? (
        candidates.length === 0 ? (
          <EmptyState icon={<UsersIcon />} title="검색 결과가 없습니다" />
        ) : (
          <ul className="flex flex-col gap-1">
            {candidates.map((member) => {
              const user = usersByUserId.get(member.userId);

              return (
                <li key={member.id}>
                  <button
                    type="button"
                    disabled={addMember.isPending}
                    onClick={() => {
                      addMember.mutate(member.userId);
                      setKeyword('');
                    }}
                    className="flex h-13 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-left hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserAvatar user={user} size={32} />
                    <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
                      {memberDisplayName(member.userId, user)}
                    </span>
                    <span className="shrink-0 typography-subtext-small text-primary">
                      추가
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : channelMembers.length === 0 ? (
        <EmptyState
          icon={<UsersIcon />}
          title="채널 멤버가 없습니다"
          description="이름으로 검색해서 추가해 보세요"
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {channelMembers.map((member: ChannelMember) => {
            const user = usersByUserId.get(member.userId);
            const name = memberDisplayName(member.userId, user);

            return (
              <li key={member.id}>
                <div className="flex h-13 items-center gap-2.5 rounded-xl px-3 hover:bg-surface-container">
                  <UserAvatar user={user} size={32} />
                  <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
                    {name}
                  </span>
                  <button
                    type="button"
                    aria-label={`${name} 채널에서 제거`}
                    disabled={removeMember.isPending}
                    onClick={() => removeMember.mutate(member.id)}
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
