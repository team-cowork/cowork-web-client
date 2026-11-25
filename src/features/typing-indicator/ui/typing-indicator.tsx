'use client';

import { useQuery } from '@tanstack/react-query';

import { userQueries } from '@/entities/user/api/user-queries';
import { cn } from '@/shared/lib/cn';

import './typing-indicator.css';

export interface TypingIndicatorProps {
  userIds: number[];
  className?: string;
}

/** `••• 도윤 님이 입력하고 있어요`, 여럿이면 `••• 도윤 님 외 2명이 입력하고 있어요` */
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
        'flex items-center gap-2 px-1 typography-subtext-medium text-on-surface-variant',
        className,
      )}
    >
      <span aria-hidden className="inline-flex items-center gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </span>
      <span>
        <strong className="font-semibold text-on-surface">{name}</strong>
        {others > 0 ? ` 님 외 ${others}명이` : ' 님이'} 입력하고 있어요
      </span>
    </p>
  );
}
