"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { cn } from "@/shared/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
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
        "bg-surface text-on-surface border-outline-variant m-auto w-[420px] max-w-[calc(100vw-2rem)] rounded-[24px] border backdrop:bg-black/50",
        className,
      )}
    >
      <div className="flex flex-col gap-[18px] p-7">
        <h2 className="typography-title-medium text-on-surface">{title}</h2>
        {description && (
          <p className="typography-subtext-large text-on-surface-variant">
            {description}
          </p>
        )}
        {children && <div className="flex justify-end gap-2.5">{children}</div>}
      </div>
    </dialog>
  );
}
