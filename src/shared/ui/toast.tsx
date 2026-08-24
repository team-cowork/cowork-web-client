import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

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
        'inline-flex items-center gap-3 rounded-[16px] bg-inverse-surface px-[18px] py-[14px] text-inverse-on-surface shadow-lg',
        className,
      )}
    >
      {icon && <span className="shrink-0 [&_svg]:size-[18px]">{icon}</span>}
      <span className="typography-label-small">{message}</span>
      {action && <span className="ml-2 shrink-0">{action}</span>}
    </div>
  );
}
