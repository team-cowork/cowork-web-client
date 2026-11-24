'use client';

import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

export interface SidePanelProps {
  title: string;
  subtitle: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  /** 본문 영역의 안쪽 여백 등 패널마다 다른 부분 */
  bodyClassName?: string;
  className?: string;
}

/** 채널 화면 오른쪽에 열리는 패널의 틀. 제목, 부제목, 닫기 버튼과 스크롤되는 본문을 둔다. */
export function SidePanel({
  title,
  subtitle,
  closeLabel,
  onClose,
  children,
  bodyClassName,
  className,
}: SidePanelProps) {
  return (
    <aside
      aria-label={title}
      className={cn(
        'flex w-100 shrink-0 flex-col border-l border-outline-variant bg-surface max-md:fixed max-md:inset-0 max-md:z-30 max-md:w-full max-md:border-l-0',
        className,
      )}
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pr-3.5 pl-4">
        <div className="flex min-w-0 flex-col gap-px">
          <h2 className="typography-label-small text-on-surface">{title}</h2>
          <p className="truncate typography-subtext-small text-on-surface-variant">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className="cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <CloseIcon size={18} />
        </button>
      </header>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-y-auto',
          bodyClassName,
        )}
      >
        {children}
      </div>
    </aside>
  );
}
