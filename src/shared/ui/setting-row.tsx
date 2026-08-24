import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface SettingRowProps {
  label: string;
  description?: string;
  /** 우측에 배치할 컨트롤 (Switch, Button, 입력 등) */
  children?: ReactNode;
  className?: string;
}

export function SettingRow({
  label,
  description,
  children,
  className,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl bg-surface px-4 py-3.5',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="typography-body-medium-strong text-on-surface">
          {label}
        </span>
        {description && (
          <span className="typography-subtext-medium text-on-surface-variant">
            {description}
          </span>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
