import { cn } from '@/shared/lib/cn';

export interface LoadingPaneProps {
  label?: string;
  className?: string;
}

export function LoadingPane({ label = '불러오는 중…', className }: LoadingPaneProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'border-outline-variant bg-surface flex flex-col items-center justify-center gap-4 rounded-[24px] border px-4 py-3',
        className,
      )}
    >
      <span className="border-outline border-t-primary size-11 animate-spin rounded-full border-[3px]" />
      <p className="typography-label-small text-on-surface-variant">{label}</p>
    </div>
  );
}
