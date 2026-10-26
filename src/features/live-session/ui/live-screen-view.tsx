'use client';

import { useEffect, useRef } from 'react';

import { type Track } from 'livekit-client';

import { cn } from '@/shared/lib/cn';

export interface LiveScreenViewProps {
  track: Track;
  className?: string;
}

export function LiveScreenView({ track, className }: LiveScreenViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    track.attach(element);

    return () => {
      track.detach(element);
    };
  }, [track]);

  // 화면 공유 오디오는 별도 트랙으로 재생되므로 영상은 항상 음소거한다
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={cn(
        'h-full w-full rounded-2xl bg-black object-contain',
        className,
      )}
    />
  );
}
