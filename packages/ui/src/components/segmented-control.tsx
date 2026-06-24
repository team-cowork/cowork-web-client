import { cn } from '../lib/cn';

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
      role="tablist"
      className={cn(
        'bg-surface-variant inline-flex items-center gap-1 rounded-xl p-1',
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
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'focus-visible:ring-primary/50 flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg px-4 transition-colors focus-visible:ring-2 focus-visible:outline-none',
              size === 'M' ? 'typography-label-small' : 'typography-label-medium',
              selected
                ? 'bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
