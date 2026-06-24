import { type ReactNode } from 'react';

import { cn } from '../lib/cn';

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
        'border-outline bg-surface flex items-center gap-3 rounded-xl border px-3 py-2',
        className,
      )}
    >
      <span className="bg-surface-variant text-on-surface-variant flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5">
        {icon ?? <FileIcon />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="typography-label-small text-on-surface truncate">{name}</p>
        {meta && <p className="typography-subtext-small text-on-surface-variant">{meta}</p>}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="첨부 삭제"
          className="text-on-surface-variant hover:bg-surface-variant hover:text-on-surface shrink-0 cursor-pointer rounded-md p-1"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
      <path d="M14 2v6h6" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      className="size-4"
    >
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}
