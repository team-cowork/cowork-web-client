'use client';

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import { type MeetingNoteTemplate } from '@/entities/meeting-note/model/meeting-note';
import { CheckIcon } from '@/shared/ui/icons/check-icon';
import { ChevronDownIcon } from '@/shared/ui/icons/chevron-down-icon';
import { FileIcon } from '@/shared/ui/icons/file-icon';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import { Menu, MenuBackdrop, MenuSeparator } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';

const LOCKED_REASON = '작성한 회의록은 템플릿을 바꿀 수 없어요';

export interface TemplatePickerProps {
  templates: MeetingNoteTemplate[];
  selected: MeetingNoteTemplate | null;
  /** 이미 쓴 회의록은 템플릿을 바꿀 수 없다. */
  locked: boolean;
  onSelect: (templateId: number) => void;
  onManage: () => void;
}

/**
 * 회의록에 쓸 템플릿을 고르는 메뉴.
 * 열면 첫 항목으로 포커스가 가고, 화살표·Home·End로 옮기며, 닫으면 여는 버튼으로 돌아온다.
 */
export function TemplatePicker({
  templates,
  selected,
  locked,
  onSelect,
  onManage,
}: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const lockedReasonId = useId();

  const items = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role^="menuitem"]:not(:disabled)',
      ) ?? [],
    );

  useEffect(() => {
    if (!open) return;
    const enabled = items();
    const checked = enabled.find(
      (item) => item.getAttribute('aria-checked') === 'true',
    );
    (checked ?? enabled[0])?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const choose = (action: () => void) => {
    close();
    action();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = items();
    const index = enabled.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (next: number) => {
      event.preventDefault();
      enabled[(next + enabled.length) % enabled.length]?.focus();
    };

    switch (event.key) {
      case 'ArrowDown':
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        focusAt(index - 1);
        break;
      case 'Home':
        focusAt(0);
        break;
      case 'End':
        focusAt(enabled.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  const label = selected ? `${selected.name} 템플릿` : '템플릿 없음';

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-describedby={locked ? lockedReasonId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex h-9 max-w-[240px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-surface-container px-3 typography-label-x-small text-on-surface hover:bg-surface-container-high"
      >
        <FileIcon size={14} className="shrink-0 text-on-surface-variant" />
        <span className="truncate">{label}</span>
        <ChevronDownIcon
          size={14}
          className="shrink-0 text-on-surface-variant"
        />
      </button>
      {locked && (
        <span id={lockedReasonId} className="sr-only">
          {LOCKED_REASON}
        </span>
      )}

      {open && (
        <>
          <MenuBackdrop onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            className="absolute top-full right-0 z-50 mt-2"
            onKeyDown={handleMenuKeyDown}
          >
            <Menu id={menuId} aria-label="회의록 템플릿">
              {locked && (
                <p className="px-2.5 pt-1.5 pb-1 typography-subtext-small text-on-surface-variant">
                  {LOCKED_REASON}
                </p>
              )}
              {templates.map((template) => {
                const isSelected = template.id === selected?.id;
                return (
                  <MenuItem
                    key={template.id}
                    role="menuitemradio"
                    aria-checked={isSelected}
                    tabIndex={-1}
                    disabled={locked && !isSelected}
                    icon={isSelected ? <CheckIcon size={16} /> : <span />}
                    onClick={() => choose(() => onSelect(template.id))}
                    className="disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {template.name}
                  </MenuItem>
                );
              })}
              {templates.length > 0 && <MenuSeparator />}
              <MenuItem
                role="menuitem"
                tabIndex={-1}
                icon={<SettingsIcon size={16} />}
                onClick={() => choose(onManage)}
              >
                템플릿 관리
              </MenuItem>
            </Menu>
          </div>
        </>
      )}
    </div>
  );
}
