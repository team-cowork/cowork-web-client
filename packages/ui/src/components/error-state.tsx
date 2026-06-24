import { type ReactNode } from 'react';

import { cn } from '../lib/cn';

export interface ErrorStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({ title, description, action, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl bg-error-container px-6 py-10 text-center text-on-error-container',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="typography-title-small text-error">{title}</h3>
        {description && <p className="typography-body-medium">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
