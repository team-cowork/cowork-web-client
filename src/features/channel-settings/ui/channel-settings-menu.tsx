'use client';

import { useEffect, useState } from 'react';

import { DeleteChannelDialog } from '@/features/channel-settings/ui/delete-channel-dialog';
import { EditChannelModal } from '@/features/channel-settings/ui/edit-channel-modal';
import { type Channel } from '@/entities/channel/model/channel';
import { EditIcon } from '@/shared/ui/icons/edit-icon';
import { MoreIcon } from '@/shared/ui/icons/more-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { Menu } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';

export interface ChannelSettingsMenuProps {
  teamId: number;
  channel: Channel;
}

export function ChannelSettingsMenu({
  teamId,
  channel,
}: ChannelSettingsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <div className="relative">
      {menuOpen && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-full right-0 z-50 mt-2">
            <Menu>
              <MenuItem
                icon={<EditIcon size={16} />}
                onClick={() => {
                  setMenuOpen(false);
                  setEditOpen(true);
                }}
              >
                채널 수정
              </MenuItem>
              <MenuItem
                icon={<TrashIcon size={16} />}
                danger
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
              >
                채널 삭제
              </MenuItem>
            </Menu>
          </div>
        </>
      )}

      <button
        type="button"
        aria-label="채널 설정"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
        className="cursor-pointer text-on-surface-variant hover:text-on-surface"
      >
        <MoreIcon size={20} />
      </button>

      <EditChannelModal
        open={editOpen}
        teamId={teamId}
        channel={channel}
        onClose={() => setEditOpen(false)}
      />
      <DeleteChannelDialog
        open={deleteOpen}
        teamId={teamId}
        channel={channel}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
