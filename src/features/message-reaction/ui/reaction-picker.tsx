'use client';

import { useEffect } from 'react';

import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { SmilePlusIcon } from '@/shared/ui/icons/smile-plus-icon';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢', '👀', '✅'];

export interface ReactionPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (emoji: string) => void;
  className?: string;
}

/** 자주 쓰는 이모지 중 하나를 골라 반응을 단다. */
export function ReactionPicker({
  open,
  onOpenChange,
  onSelect,
  className,
}: ReactionPickerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <div className={cn('relative', className)}>
      <IconButton
        aria-label="반응 추가"
        aria-haspopup="menu"
        aria-expanded={open}
        size="S"
        variant="clear"
        onClick={() => onOpenChange(!open)}
      >
        <SmilePlusIcon />
      </IconButton>

      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40"
            onClick={() => onOpenChange(false)}
          />
          <div
            role="menu"
            className="absolute top-full right-0 z-50 mt-1 grid grid-cols-4 gap-0.5 rounded-[10px] border border-outline-variant bg-surface-container-low p-1.5 shadow-lg"
          >
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                role="menuitem"
                aria-label={`${emoji} 반응`}
                onClick={() => {
                  onSelect(emoji);
                  onOpenChange(false);
                }}
                className="flex size-9 cursor-pointer items-center justify-center rounded-[8px] text-xl hover:bg-surface-variant"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
