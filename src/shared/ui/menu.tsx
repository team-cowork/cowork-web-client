import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface MenuProps {
  children: ReactNode;
  className?: string;
}

/** 드롭다운·컨텍스트 메뉴 팝오버 컨테이너. MenuItem을 자식으로 담는다. */
export function Menu({ children, className }: MenuProps) {
  return (
    <div
      role="menu"
      className={cn(
        'flex min-w-[220px] flex-col gap-0.5 rounded-[10px] border border-outline-variant bg-surface-container-low p-1.5 shadow-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface MenuSeparatorProps {
  className?: string;
}

export function MenuSeparator({ className }: MenuSeparatorProps) {
  return (
    <div
      role="separator"
      className={cn('my-1 h-px bg-outline-variant', className)}
    />
  );
}
