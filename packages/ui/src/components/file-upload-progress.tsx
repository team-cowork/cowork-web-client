import { cn } from '../lib/cn';

export interface FileUploadProgressProps {
  name: string;
  progress: number;
  className?: string;
}

export function FileUploadProgress({ name, progress, className }: FileUploadProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="typography-label-small text-on-surface truncate">{name}</p>
        <span className="typography-subtext-small text-on-surface-variant shrink-0">
          {clamped}%
        </span>
      </div>
      <div className="bg-surface-variant h-1.5 w-full overflow-hidden rounded-full">
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          className="bg-primary h-full rounded-full transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
