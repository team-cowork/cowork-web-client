import { type ReactNode, useEffect, useRef } from 'react';

import { cn } from '../lib/cn';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        'bg-surface text-on-surface m-auto w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl p-6 backdrop:bg-black/50',
        className,
      )}
    >
      <h2 className="typography-title-small text-on-surface">{title}</h2>
      {description && (
        <p className="typography-body-medium text-on-surface-variant mt-2">{description}</p>
      )}
      {children && <div className="mt-6 flex justify-end gap-2">{children}</div>}
    </dialog>
  );
}
