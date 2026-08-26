'use client';

import { cn } from '@/shared/lib/cn';
import { PaperclipIcon } from '@/shared/ui/icons/paperclip-icon';

export interface AttachButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function AttachButton({
  onClick,
  disabled = onClick === undefined,
  className,
}: AttachButtonProps) {
  return (
    <button
      type="button"
      aria-label="파일 첨부"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'cursor-pointer text-on-surface-variant hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-on-surface-variant',
        className,
      )}
    >
      <PaperclipIcon size={20} />
    </button>
  );
}
