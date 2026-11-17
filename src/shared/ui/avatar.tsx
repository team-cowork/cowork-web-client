'use client';

import { useState } from 'react';

import Image from 'next/image';

import { isApiOrigin } from '@/shared/lib/api-origin';
import { cn } from '@/shared/lib/cn';

export type AvatarTone =
  'default' | 'blue' | 'green' | 'amber' | 'red' | 'neutral';

const toneClass: Record<AvatarTone, string> = {
  default: 'bg-tertiary-container text-on-tertiary-container',
  blue: 'bg-cowork-blue-500 text-white',
  green: 'bg-cowork-green-500 text-white',
  amber: 'bg-cowork-amber-500 text-white',
  red: 'bg-primary text-on-primary',
  neutral: 'bg-cowork-neutral-500 text-white',
};

export type AvatarShape = 'circle' | 'squircle';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  shape?: AvatarShape;
  tone?: AvatarTone;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export function Avatar({
  src,
  name,
  size = 40,
  shape = 'squircle',
  tone = 'default',
  loading = 'lazy',
  className,
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const initials = name ? name.trim().slice(0, 2).toUpperCase() : '';

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: shape === 'circle' ? '9999px' : size * 0.28,
        fontSize: Math.round(size * 0.33),
      }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden font-bold',
        toneClass[tone],
        className,
      )}
    >
      {src && src !== failedSrc ? (
        <Image
          src={src}
          alt={name ?? ''}
          width={size}
          height={size}
          loading={loading}
          // 게이트웨이 스토리지 이미지(프로필의 서명 주소, 팀 아이콘)는 브라우저가 직접 받는다.
          // 서명이 매번 바뀌어 최적화 캐시가 쌓이기만 하고, 서명이 만료되면 서버의 재검증도 실패한다.
          unoptimized={isApiOrigin(src)}
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}
