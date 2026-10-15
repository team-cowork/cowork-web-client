import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface SettingsCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SettingsCard({
  title,
  children,
  className,
}: SettingsCardProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-3.5 rounded-[14px] bg-surface px-5 pt-4 pb-[18px]',
        className,
      )}
    >
      <h2 className="text-[0.875rem] font-semibold text-on-surface-variant">
        {title}
      </h2>
      {children}
    </section>
  );
}
