'use client';

import { type ReactNode } from 'react';

import { type Track } from 'livekit-client';

import { LiveScreenView } from '@/features/live-session/ui/live-screen-view';
import { cn } from '@/shared/lib/cn';
import { useElapsedTime } from '@/shared/lib/use-elapsed-time';
import { HeadphonesIcon } from '@/shared/ui/icons/headphones-icon';

export interface LiveStreamFocusProps {
  track: Track | null;
  title: string;
  viewerCount: number;
  startedAt?: string;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  closeLabel: string;
  onClose: () => void;
  footer?: ReactNode;
  className?: string;
}

export function LiveStreamFocus({
  track,
  title,
  viewerCount,
  startedAt,
  audioEnabled,
  onToggleAudio,
  closeLabel,
  onClose,
  footer,
  className,
}: LiveStreamFocusProps) {
  const elapsed = useElapsedTime(startedAt);

  return (
    <div className={cn('flex min-h-0 w-full flex-1 flex-col gap-4', className)}>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
        {track ? (
          <LiveScreenView track={track} className="rounded-none" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="typography-label-small text-cowork-neutral-300">
              화면을 불러오는 중…
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/60 to-transparent p-3">
          <span className="rounded-md bg-error px-1.5 py-0.5 text-[0.6875rem] font-bold text-on-error">
            LIVE
          </span>
          {elapsed && (
            <span className="shrink-0 typography-subtext-small text-white tabular-nums">
              {elapsed}
            </span>
          )}
          <span className="min-w-0 truncate typography-label-small text-white">
            {title}
          </span>
          <span className="shrink-0 typography-subtext-small text-cowork-neutral-300">
            시청자 {viewerCount}명
          </span>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {onToggleAudio && (
              <button
                type="button"
                aria-label={audioEnabled ? '방송 소리 끄기' : '방송 소리 켜기'}
                aria-pressed={!audioEnabled}
                onClick={onToggleAudio}
                className={cn(
                  'flex size-9 cursor-pointer items-center justify-center rounded-full',
                  audioEnabled
                    ? 'bg-white/15 text-white hover:bg-white/25'
                    : 'bg-error text-on-error',
                )}
              >
                <HeadphonesIcon size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-9 cursor-pointer rounded-full bg-white/15 px-4 typography-label-small text-white hover:bg-white/25"
            >
              {closeLabel}
            </button>
          </div>
        </div>
      </div>

      {footer}
    </div>
  );
}
