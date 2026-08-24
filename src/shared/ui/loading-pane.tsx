import { cn } from '@/shared/lib/cn';

export interface LoadingPaneProps {
  label?: string;
  className?: string;
}

export function LoadingPane({
  label = '불러오는 중…',
  className,
}: LoadingPaneProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-[24px] border border-outline-variant bg-surface px-4 py-3',
        className,
      )}
    >
      <span className="size-11 animate-spin rounded-full border-[3px] border-outline border-t-primary" />
      <p className="typography-label-small text-on-surface-variant">{label}</p>
    </div>
  );
}
