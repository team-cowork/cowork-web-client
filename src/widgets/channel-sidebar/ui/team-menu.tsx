'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { teamSettingsProfilePath } from '@/shared/model/paths';
import { useEscapeToClose } from '@/shared/lib/use-escape-to-close';
import { ChevronDownIcon } from '@/shared/ui/icons/chevron-down-icon';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import { Menu, MenuBackdrop } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';

export interface TeamMenuProps {
  teamId: number;
}

export function TeamMenu({ teamId }: TeamMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEscapeToClose(open, () => setOpen(false));

  return (
    <div className="relative">
      {open && (
        <>
          <MenuBackdrop onClick={() => setOpen(false)} />
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
