'use client';

import { type Track } from 'livekit-client';

import { LiveScreenView } from '@/features/live-session/ui/live-screen-view';
import { cn } from '@/shared/lib/cn';
import { useElapsedTime } from '@/shared/lib/use-elapsed-time';
import { Button } from '@/shared/ui/button';
import { MonitorIcon } from '@/shared/ui/icons/monitor-icon';

export interface LiveStreamTileProps {
  hostName: string;
  viewerCount: number;
  startedAt?: string;
  isMine: boolean;
  previewTrack?: Track | null;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  className?: string;
}

export function LiveStreamTile({
  hostName,
  viewerCount,
  startedAt,
  isMine,
  previewTrack,
  actionLabel,
  onAction,
  disabled = false,
  className,
}: LiveStreamTileProps) {
  const elapsed = useElapsedTime(startedAt);

  return (
    <div
      className={cn(
        'relative flex h-49 w-70 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-cowork-neutral-900 p-4',
        className,
      )}
    >
      {previewTrack ? (
        <LiveScreenView
          track={previewTrack}
          className="absolute inset-0 rounded-none opacity-60"
        />
      ) : (
        <MonitorIcon size={36} className="text-cowork-neutral-300" />
      )}

      <span className="absolute top-3 left-3 flex items-center gap-1.5">
        <span className="rounded-md bg-error px-1.5 py-0.5 text-[0.6875rem] font-bold text-on-error">
          LIVE
        </span>
        {elapsed && (
          <span className="typography-subtext-small text-white tabular-nums">
            {elapsed}
          </span>
        )}
      </span>
      <span className="absolute top-3 right-3 typography-subtext-small text-cowork-neutral-300">
        시청자 {viewerCount}명
      </span>

      <p className="relative max-w-full truncate typography-label-small text-white">
        {isMine ? '내 화면' : `${hostName}님의 화면`}
      </p>
      <Button
        size="S"
        variant="weak"
        onClick={onAction}
        disabled={disabled}
        className="relative"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
