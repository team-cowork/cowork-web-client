import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { FileIcon } from '@/shared/ui/icons/file-icon';

export interface AttachmentCardProps {
  name: string;
  meta?: string;
  icon?: ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function AttachmentCard({
  name,
  meta,
  icon,
  onRemove,
  className,
}: AttachmentCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-[14px] rounded-[16px] border border-outline-variant bg-surface p-[14px]',
        className,
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container [&_svg]:size-6">
        {icon ?? <FileIcon />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate typography-label-small text-on-surface">
          {name}
        </p>
        {meta && (
          <p className="typography-subtext-medium text-on-surface-variant">
            {meta}
          </p>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="첨부 삭제"
          className="shrink-0 cursor-pointer rounded-md p-1 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
