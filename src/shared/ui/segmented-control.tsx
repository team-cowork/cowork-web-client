'use client';

import { cn } from '@/shared/lib/cn';

export interface SegmentedControlOption<T extends string> {
  label: string;
  value: T;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'M' | 'L';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'M',
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex items-center gap-1 rounded-[14px] bg-surface-container p-1',
        size === 'M' ? 'h-11' : 'h-[52px]',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-full flex-1 cursor-pointer items-center justify-center rounded-[10px] px-3 typography-label-small transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
              selected
                ? 'bg-surface text-on-surface shadow-sm'
                : 'font-medium text-on-surface-variant hover:text-on-surface',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
