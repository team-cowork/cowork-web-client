'use client';

import { cn } from '@/shared/lib/cn';
import { useMobileNavStore } from '@/shared/model/mobile-nav-store';
import { ChevronLeftIcon } from '@/shared/ui/icons/chevron-left-icon';

export function MobileNavButton({ className }: { className?: string }) {
  const setOpen = useMobileNavStore((state) => state.setOpen);

  return (
    <button
      type="button"
      aria-label="목록으로"
      onClick={() => setOpen(true)}
      className={cn(
        '-ml-1 shrink-0 cursor-pointer text-on-surface-variant hover:text-on-surface md:hidden',
        className,
      )}
    >
      <ChevronLeftIcon size={24} />
    </button>
  );
}
