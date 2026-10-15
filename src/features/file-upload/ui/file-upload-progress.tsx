import { cn } from '@/shared/lib/cn';

export interface FileUploadProgressProps {
  name: string;
  progress: number;
  className?: string;
}

export function FileUploadProgress({
  name,
  progress,
  className,
}: FileUploadProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[16px] border border-outline-variant bg-surface p-4',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <p className="truncate typography-label-small text-on-surface">
          {name}
        </p>
        <span className="shrink-0 typography-subtext-medium text-on-surface-variant">
          {clamped}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
        <div
          role="progressbar"
          aria-label={`${name} 업로드 진행률`}
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
