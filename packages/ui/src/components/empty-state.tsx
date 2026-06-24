import { type ReactNode } from 'react';

import { cn } from '../lib/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <span className="bg-surface-variant text-on-surface-variant flex size-12 items-center justify-center rounded-full [&_svg]:size-6">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="typography-title-small text-on-surface">{title}</h3>
        {description && (
          <p className="typography-body-medium text-on-surface-variant">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
