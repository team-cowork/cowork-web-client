import { type ReactNode } from 'react';

import { cn } from '../lib/cn';

export interface ToastProps {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Toast({ message, icon, action, className }: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        'bg-inverse-surface text-inverse-on-surface inline-flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg',
        className,
      )}
    >
      {icon && <span className="shrink-0 [&_svg]:size-5">{icon}</span>}
      <span className="typography-body-medium">{message}</span>
      {action && <span className="ml-2 shrink-0">{action}</span>}
    </div>
  );
}
