import { cn } from '../lib/cn';

export interface LoadingPaneProps {
  label?: string;
  className?: string;
}

export function LoadingPane({ label = '불러오는 중…', className }: LoadingPaneProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12', className)}
    >
      <span className="size-6 animate-spin rounded-full border-2 border-outline border-t-primary" />
      <p className="typography-subtext-large text-on-surface-variant">{label}</p>
    </div>
  );
}
