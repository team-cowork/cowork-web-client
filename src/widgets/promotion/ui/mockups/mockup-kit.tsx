'use client';

import { type ReactNode, useCallback, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib/cn';

/** 새로 생긴 항목이 살짝 튀어 오르며 나타나는 효과 */
export const POP_IN = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: 'spring', stiffness: 420, damping: 26 },
} as const;

/** 목록 순서가 바뀔 때 항목이 제자리로 미끄러지는 효과 */
export const LAYOUT_SPRING = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
} as const;

export const avatarUrl = (img: number) => `https://i.pravatar.cc/80?img=${img}`;

/** 목업용 가짜 프로필 사진. 장식이라 대체 텍스트를 비운다. */
export function MockAvatar({
  img,
  size,
  className,
}: {
  img: number;
  size: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 외부 더미 이미지라 최적화 대상이 아니다.
    <img
      src={avatarUrl(img)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{ width: size, height: size }}
      className={cn(
        'shrink-0 rounded-full bg-gray-100 object-cover',
        className,
      )}
    />
  );
}

/** 모든 목업이 공유하는 4:3 바깥 틀 */
export function MockupFrame({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative aspect-[4/3] rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 select-none sm:p-5">
      <div
        className={cn(
          'absolute inset-4 flex flex-col overflow-hidden rounded-2xl shadow-2xl sm:inset-5',
          className ?? 'bg-white text-gray-900',
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function MockChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onClick}
      className={cn(
        'rounded-full px-2 py-0.5 text-[9px] font-semibold',
        active ? 'bg-(--accent) text-white' : 'bg-gray-100 text-gray-500',
      )}
    >
      {children}
    </button>
  );
}

/** 컴포넌트가 사라질 때 함께 취소되는 setTimeout */
export function useTimers() {
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return useCallback((delay: number, callback: () => void) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);
}
