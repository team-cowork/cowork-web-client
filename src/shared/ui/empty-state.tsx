import { type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-outline-variant bg-surface flex flex-col items-center justify-center gap-3.5 rounded-[24px] border px-4 py-8 text-center",
        className,
      )}
    >
      {icon && (
        <span className="bg-surface-variant text-on-surface-variant flex size-16 items-center justify-center rounded-[20px] [&_svg]:size-8">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="typography-title-small text-on-surface">{title}</h3>
        {description && (
          <p className="typography-subtext-large text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
