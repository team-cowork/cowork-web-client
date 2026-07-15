'use client';

import { type ReactNode, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** 하단 액션 영역 (버튼 등) */
  footer?: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
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
        'bg-surface text-on-surface m-auto w-[480px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[20px] backdrop:bg-black/55',
        className,
      )}
    >
      <div className="border-outline-variant flex items-center justify-between border-b py-[18px] pr-5 pl-6">
        <h2 className="typography-title-small text-on-surface">{title}</h2>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface flex size-6 cursor-pointer items-center justify-center"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {children && <div className="flex flex-col gap-3 px-6 py-5">{children}</div>}
      {footer && (
        <div className="border-outline-variant flex justify-end gap-2.5 border-t px-6 pt-4 pb-5">
          {footer}
        </div>
      )}
    </dialog>
  );
}
