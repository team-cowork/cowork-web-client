'use client';

import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { type User, toUserStatus } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface MemberPanelProps {
  channelId: number;
  className?: string;
}

function isOnline(user: User): boolean {
  const status = toUserStatus(user.status);

  return status !== null && status !== 'OFFLINE';
}

const MEMBER_SKELETON = (
  <ul className="flex flex-col gap-1">
    {Array.from({ length: 4 }, (_, index) => (
      <li key={index}>
        <span className="bg-surface-container block h-11 animate-pulse rounded-lg" />
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
      className={cn('bg-surface w-60 shrink-0 overflow-y-auto p-2', className)}
    >
      <QueryBoundary loadingFallback={MEMBER_SKELETON} errorFallback={MemberPanelError}>
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

  if (loading) return MEMBER_SKELETON;

  return (
    <>
      {users.length === 0 && (
        <p className="typography-subtext-medium text-on-surface-variant px-2 py-4">
          표시할 멤버가 없습니다
        </p>
      )}

      <MemberSection label="온라인" users={online} />
      <MemberSection label="오프라인" users={offline} dimmed />
    </>
  );
}

interface MemberSectionProps {
  label: string;
  users: User[];
  dimmed?: boolean;
}

function MemberSection({ label, users, dimmed }: MemberSectionProps) {
  if (users.length === 0) return null;

  return (
    <section>
      <h3 className="typography-subtext-small text-on-surface-variant flex h-8 items-center px-2">
        {label} — {users.length}
      </h3>
      <ul className="flex flex-col">
        {users.map((user) => (
          <li
            key={user.id}
            className={cn(
              'hover:bg-surface-container flex h-11 items-center gap-2.5 rounded-lg px-2',
              dimmed && 'opacity-50',
            )}
          >
            <UserAvatar user={user} size={32} />
            <span className="typography-label-x-small text-on-surface min-w-0 flex-1 truncate">
              {user.nickname ?? user.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
