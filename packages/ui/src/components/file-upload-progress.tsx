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
        <p className="typography-label-small truncate text-on-surface">{name}</p>
        <span className="typography-subtext-small shrink-0 text-on-surface-variant">{clamped}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
