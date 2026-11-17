import { type ReactNode } from 'react';

import { Badge } from '@/shared/ui/badge';

export interface KanbanColumnProps {
  title: string;
  count: number;
  children: ReactNode;
  /** 열이 비었을 때 보여 줄 안내 */
  emptyText?: string;
}

/** 칸반의 열 하나. 제목과 개수 아래에 카드 목록([children])을 둔다. */
export function KanbanColumn({
  title,
  count,
  children,
  emptyText,
}: KanbanColumnProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-xl bg-surface-container p-3">
      <h2 className="flex items-center gap-2 typography-label-medium text-on-surface">
        <span aria-hidden className="size-1.5 rounded-full bg-on-surface" />
        {title}
        <Badge>{count}</Badge>
      </h2>
      {children}
      {count === 0 && emptyText && (
        <p className="typography-subtext-medium text-on-surface-variant">
          {emptyText}
        </p>
      )}
    </section>
  );
}
