'use client';

import { useState } from 'react';

import { useDeleteTeamRole } from '@/features/team-roles/model/use-delete-team-role';
import { type TeamRole } from '@/entities/team/model/team';
import { useEscapeToClose } from '@/shared/lib/use-escape-to-close';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { IconButton } from '@/shared/ui/icon-button';
import { MoreIcon } from '@/shared/ui/icons/more-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { Menu, MenuBackdrop } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';

export interface DeleteTeamRoleMenuProps {
  teamId: number;
  role: TeamRole;
  onDeleted?: () => void;
}

export function DeleteTeamRoleMenu({
  teamId,
  role,
  onDeleted,
}: DeleteTeamRoleMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteRole = useDeleteTeamRole(teamId);

  useEscapeToClose(menuOpen, () => setMenuOpen(false));

  const handleDelete = () => {
    deleteRole.mutate(role.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        onDeleted?.();
      },
    });
  };

  return (
    <div className="relative">
      {menuOpen && (
        <>
          <MenuBackdrop onClick={() => setMenuOpen(false)} />
          <div className="absolute top-full right-0 z-50 mt-2">
            <Menu>
              <MenuItem
                icon={<TrashIcon size={16} />}
                danger
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
              >
                역할 삭제
              </MenuItem>
            </Menu>
          </div>
        </>
      )}

      <IconButton
        aria-label="역할 메뉴"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        size="S"
        variant="border"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <MoreIcon size={16} />
      </IconButton>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="역할을 삭제할까요?"
        description={`"${role.name}" 역할이 삭제되고, 이 역할을 가진 모든 멤버에게서 제거됩니다.`}
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={deleteRole.isPending}
          onClick={() => setConfirmOpen(false)}
        >
          취소
        </Button>
        <Button
          type="button"
          color="danger"
          disabled={deleteRole.isPending}
          onClick={handleDelete}
        >
          {deleteRole.isPending ? '삭제하는 중…' : '삭제'}
        </Button>
      </Dialog>
    </div>
  );
}
