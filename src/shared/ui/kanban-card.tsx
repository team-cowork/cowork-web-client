import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface KanbanCardProps {
  children: ReactNode;
  /** 있으면 새 탭으로 여는 링크 카드 */
  href?: string;
  /** 있으면 누를 수 있는 버튼 카드 */
  onClick?: () => void;
  dragging?: boolean;
}

const cardClass =
  'flex w-full flex-col items-start gap-2 rounded-lg border border-outline-variant bg-surface p-3 text-left';

/** 칸반의 카드 하나. 링크·버튼·정적 카드를 같은 모양으로 그린다. */
export function KanbanCard({
  children,
  href,
  onClick,
  dragging,
}: KanbanCardProps) {
  const className = cn(cardClass, dragging && 'shadow-lg');

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        className={cn(className, 'hover:bg-surface-variant')}
      >
        {children}
      </a>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(className, 'cursor-pointer hover:bg-surface-variant')}
      >
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
}
