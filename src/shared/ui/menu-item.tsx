import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  hasSubmenu?: boolean;
}

export function MenuItem({
  children,
  icon,
  danger = false,
  hasSubmenu = false,
  className,
  type = 'button',
  ...props
}: MenuItemProps) {
  return (
    <button
      type={type}
      className={cn(
        'typography-subtext-large flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors',
        danger ? 'text-error hover:bg-error/10' : 'text-on-surface hover:bg-surface-container',
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            'flex size-4 shrink-0 items-center justify-center',
            !danger && 'text-on-surface-variant',
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {hasSubmenu && (
        <svg className="text-on-surface-variant size-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
          <path
            d="m9 6 6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
