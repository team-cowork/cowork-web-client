'use client';

import { useQuery } from '@tanstack/react-query';

import { userQueries } from '@/entities/user/api/user-queries';
import { cn } from '@/shared/lib/cn';

export interface TypingIndicatorProps {
  userIds: number[];
  className?: string;
}

/** `도윤님이 입력 중…`, 여럿이면 `도윤님 외 2명이 입력 중…` */
export function TypingIndicator({ userIds, className }: TypingIndicatorProps) {
  const [firstId] = userIds;
  const { data: first } = useQuery({
    ...userQueries.detail(firstId ?? 0),
    enabled: firstId !== undefined,
  });

  if (firstId === undefined) return null;

  const name = first ? (first.nickname ?? first.name) : '누군가';
  const others = userIds.length - 1;

  return (
    <p
      role="status"
      className={cn(
        'px-1 typography-subtext-medium text-on-surface-variant',
        className,
      )}
    >
      {others > 0 ? `${name}님 외 ${others}명이` : `${name}님이`} 입력 중…
    </p>
  );
}
