import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface SettingsNavItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
  danger?: boolean;
}

export function SettingsNavItem({
  children,
  active = false,
  danger = false,
  className,
  type = 'button',
  ...props
}: SettingsNavItemProps) {
  return (
    <button
      type={type}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-9 w-full cursor-pointer items-center rounded-lg px-2.5 text-left typography-label-small transition-colors',
        danger
          ? 'text-error hover:bg-error/10'
          : active
            ? 'bg-surface-container text-on-surface'
            : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
