'use client';

import { useQuery } from '@tanstack/react-query';

import { liveQueries } from '@/entities/live/api/live-queries';
import { cn } from '@/shared/lib/cn';
import { useElapsedTime } from '@/shared/lib/use-elapsed-time';

export interface LiveStatusBadgeProps {
  channelId: number;
  className?: string;
}

export function LiveStatusBadge({
  channelId,
  className,
}: LiveStatusBadgeProps) {
  const { data } = useQuery(liveQueries.status(channelId));
  const elapsed = useElapsedTime(data?.live ? data.started_at : null);

  if (!data?.live) return null;

  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-[5px] rounded-md bg-surface-container px-2 py-[3px]',
        className,
      )}
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 animate-pulse rounded-full bg-error"
      />
      <span className="typography-subtext-small text-on-surface-variant">
        <span className="font-semibold text-error">LIVE</span>
        {elapsed && <span className="tabular-nums"> · {elapsed}</span>} · 시청자{' '}
        {data.viewer_count}명
      </span>
    </span>
  );
}
