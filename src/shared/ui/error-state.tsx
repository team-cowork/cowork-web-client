import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface ErrorStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title,
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3.5 rounded-[24px] bg-error-container px-4 py-3 text-center text-on-error-container',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="typography-title-small text-on-error-container">
          {title}
        </h3>
        {description && (
          <p className="typography-subtext-large">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
