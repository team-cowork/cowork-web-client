'use client';

import { type ReactNode, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** 하단 액션 영역 (버튼 등) */
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        'm-auto max-h-[85vh] w-[480px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[20px] bg-surface text-on-surface backdrop:bg-black/55',
        open ? 'flex' : 'hidden',
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-outline-variant py-[18px] pr-5 pl-6">
        <h2 className="typography-title-small text-on-surface">{title}</h2>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex size-6 cursor-pointer items-center justify-center text-on-surface-variant hover:text-on-surface"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>
      {children && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-5">
          {children}
        </div>
      )}
      {footer && (
        <div className="flex shrink-0 justify-end gap-2.5 border-t border-outline-variant px-6 pt-4 pb-5">
          {footer}
        </div>
      )}
    </dialog>
  );
}
