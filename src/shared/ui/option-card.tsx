import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface OptionCardProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'title'
> {
  label: string;
  description?: string;
  icon?: ReactNode;
  selected?: boolean;
}

export function OptionCard({
  label,
  description,
  icon,
  selected = false,
  className,
  type = 'button',
  ...props
}: OptionCardProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
        selected
          ? 'border-primary bg-surface-container'
          : 'border-outline-variant bg-surface-container-low hover:border-outline',
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="typography-label-small text-on-surface">{label}</span>
        {description && (
          <span className="typography-subtext-small text-on-surface-variant">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
