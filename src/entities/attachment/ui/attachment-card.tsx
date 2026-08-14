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

export function AttachmentCard({ name, meta, icon, onRemove, className }: AttachmentCardProps) {
  return (
    <div
      className={cn(
        'border-outline-variant bg-surface flex items-center gap-[14px] rounded-[16px] border p-[14px]',
        className,
      )}
    >
      <span className="bg-tertiary-container text-on-tertiary-container flex size-12 shrink-0 items-center justify-center rounded-xl [&_svg]:size-6">
        {icon ?? <FileIcon />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="typography-label-small text-on-surface truncate">{name}</p>
        {meta && <p className="typography-subtext-medium text-on-surface-variant">{meta}</p>}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="첨부 삭제"
          className="text-on-surface-variant hover:bg-surface-variant hover:text-on-surface shrink-0 cursor-pointer rounded-md p-1"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
