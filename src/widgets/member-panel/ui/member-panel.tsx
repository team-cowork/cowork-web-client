'use client';

import { useState } from 'react';

import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { type User, resolveUserStatus } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { UserProfilePopover } from '@/features/user-profile-view/ui/user-profile-popover';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface MemberPanelProps {
  channelId: number;
  className?: string;
}

function isOnline(user: User): boolean {
  const status = resolveUserStatus(user);

  return status !== null && status !== 'offline';
}

const MEMBER_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 4 }, (_, index) => (
      <li key={index}>
        <span className="block h-11 animate-pulse rounded-lg bg-surface-container" />
      </li>
    ))}
  </ul>
);

function MemberPanelError({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-start gap-2 px-2 py-4">
      <p className="typography-subtext-medium text-on-surface-variant">
        멤버 목록을 불러오지 못했습니다
      </p>
      <Button size="S" variant="weak" onClick={resetErrorBoundary}>
        다시 시도
      </Button>
    </div>
  );
}

export function MemberPanel({ channelId, className }: MemberPanelProps) {
  return (
    <aside
      aria-label="채널 멤버"
      className={cn('w-60 shrink-0 overflow-y-auto bg-surface p-2', className)}
    >
      <QueryBoundary
        loadingFallback={MEMBER_SKELETON}
        errorFallback={MemberPanelError}
        resetKeys={[channelId]}
      >
        <MemberList channelId={channelId} />
      </QueryBoundary>
    </aside>
  );
}

function MemberList({ channelId }: { channelId: number }) {
  const { data: members } = useSuspenseQuery(channelQueries.members(channelId));

  const results = useQueries({
    queries: members.map((member) => userQueries.detail(member.userId)),
  });

  const users = results.flatMap((result) => (result.data ? [result.data] : []));
  const online = users.filter(isOnline);
  const offline = users.filter((user) => !isOnline(user));
  const loading = results.some((result) => result.isPending);
  // 프로필을 띄울 멤버와 누른 항목. 닫혀 있으면 null이다.
  const [profile, setProfile] = useState<{
    userId: number;
    anchor: HTMLElement;
  } | null>(null);
  const openProfile = (userId: number, anchor: HTMLElement) =>
    setProfile({ userId, anchor });

  if (loading) return MEMBER_SKELETON;

  return (
    <>
      {users.length === 0 && (
        <p className="px-2 py-4 typography-subtext-medium text-on-surface-variant">
          표시할 멤버가 없습니다
        </p>
      )}

      <MemberSection label="온라인" users={online} onSelect={openProfile} />
      <MemberSection
        label="오프라인"
        users={offline}
        onSelect={openProfile}
        dimmed
      />

      {profile && (
        <UserProfilePopover
          userId={profile.userId}
          anchor={profile.anchor}
          onClose={() => setProfile(null)}
        />
      )}
    </>
  );
}

interface MemberSectionProps {
  label: string;
  users: User[];
  /** 멤버를 누르면 그 항목 옆에 프로필을 연다 */
  onSelect: (userId: number, anchor: HTMLElement) => void;
  dimmed?: boolean;
}

function MemberSection({ label, users, onSelect, dimmed }: MemberSectionProps) {
  if (users.length === 0) return null;

  return (
    <section>
      <h3 className="flex h-8 items-center px-2 typography-subtext-small text-on-surface-variant">
        {label} — {users.length}
      </h3>
      <ul className="flex flex-col">
        {users.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              aria-label={`${user.nickname ?? user.name} 프로필 보기`}
              onClick={(event) => onSelect(user.id, event.currentTarget)}
              className={cn(
                'flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 text-left hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
                dimmed && 'opacity-50',
              )}
            >
              <UserAvatar user={user} size={32} />
              <span className="min-w-0 flex-1 truncate typography-label-x-small text-on-surface">
                {user.nickname ?? user.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
