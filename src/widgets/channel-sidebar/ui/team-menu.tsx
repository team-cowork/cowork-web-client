'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { teamSettingsProfilePath } from '@/shared/model/paths';
import { ChevronDownIcon } from '@/shared/ui/icons/chevron-down-icon';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import { Menu } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';

export interface TeamMenuProps {
  teamId: number;
}

export function TeamMenu({ teamId }: TeamMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div className="relative">
      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full right-0 z-50 mt-2">
            <Menu>
              <MenuItem
                icon={<SettingsIcon size={16} />}
                onClick={() => {
                  setOpen(false);
                  router.push(teamSettingsProfilePath(teamId));
                }}
              >
                팀 설정
              </MenuItem>
            </Menu>
          </div>
        </>
      )}

      <button
        type="button"
        aria-label="팀 메뉴"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="shrink-0 cursor-pointer text-on-surface-variant hover:text-on-surface"
      >
        <ChevronDownIcon size={18} />
      </button>
    </div>
  );
}
