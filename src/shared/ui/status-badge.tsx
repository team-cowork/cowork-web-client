import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export type StatusBadgeStatus = 'planned' | 'inProgress' | 'done' | 'open' | 'closed';

const dotColor: Record<StatusBadgeStatus, string> = {
  planned: 'bg-on-surface-variant',
  inProgress: 'bg-cowork-blue-500',
  done: 'bg-cowork-green-500',
  open: 'bg-cowork-green-500',
  closed: 'bg-on-surface-variant',
};

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'bg-surface-container text-on-surface inline-flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 text-[0.6875rem] font-semibold whitespace-nowrap',
        className,
      )}
    >
      <span className={cn('size-2 shrink-0 rounded-full', dotColor[status])} />
      {children}
    </span>
  );
}
