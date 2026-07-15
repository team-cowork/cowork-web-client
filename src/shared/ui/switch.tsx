"use client";

import { cn } from "@/shared/lib/cn";

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Switch({
  checked = false,
  onCheckedChange,
  disabled,
  className,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "focus-visible:ring-primary/50 relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
        checked ? "bg-success" : "bg-outline",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block size-6 rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
