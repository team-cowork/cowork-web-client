'use client';

import { useEffect, useRef } from 'react';

import { type Track } from 'livekit-client';

import { cn } from '@/shared/lib/cn';

export interface TrackVideoProps {
  track: Track;
  /** 화면 공유는 잘리지 않게 contain, 카메라는 칸을 채우게 cover */
  fit?: 'contain' | 'cover';
  /** 내 카메라는 거울처럼 좌우를 뒤집어 보여 준다 */
  mirrored?: boolean;
  className?: string;
}

export function TrackVideo({
  track,
  fit = 'contain',
  mirrored = false,
  className,
}: TrackVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    track.attach(element);

    return () => {
      track.detach(element);
    };
  }, [track]);

  // 소리는 별도 오디오 트랙으로 재생되므로 영상은 항상 음소거한다
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={cn(
        'h-full w-full rounded-2xl bg-black',
        fit === 'cover' ? 'object-cover' : 'object-contain',
        mirrored && '-scale-x-100',
        className,
      )}
    />
  );
}
