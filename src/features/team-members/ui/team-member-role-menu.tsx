'use client';

import { useEffect, useState } from 'react';

import { useChangeTeamMemberRole } from '@/features/team-members/model/use-change-team-member-role';
import {
  TEAM_MEMBER_ROLE_LABEL,
  type AssignableTeamMemberRole,
  type TeamMemberRole,
} from '@/entities/team/model/team';
import { Badge } from '@/shared/ui/badge';
import { ChevronDownIcon } from '@/shared/ui/icons/chevron-down-icon';
import { Menu } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';

const ASSIGNABLE_ROLES: AssignableTeamMemberRole[] = ['ADMIN', 'MEMBER'];

export interface TeamMemberRoleMenuProps {
  teamId: number;
  targetUserId: number;
  role: TeamMemberRole;
}

export function TeamMemberRoleMenu({
  teamId,
  targetUserId,
  role,
}: TeamMemberRoleMenuProps) {
  const [open, setOpen] = useState(false);
  const changeRole = useChangeTeamMemberRole(teamId);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (role === 'OWNER') {
    return <Badge color="brand">소유자</Badge>;
  }

  const handleSelect = (nextRole: AssignableTeamMemberRole) => {
    setOpen(false);
    if (nextRole === role) return;
    changeRole.mutate({ targetUserId, role: nextRole });
  };

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
              {ASSIGNABLE_ROLES.map((candidate) => (
                <MenuItem
                  key={candidate}
                  onClick={() => handleSelect(candidate)}
                >
                  {TEAM_MEMBER_ROLE_LABEL[candidate]}
                </MenuItem>
              ))}
            </Menu>
          </div>
        </>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={changeRole.isPending}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2.5 typography-subtext-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
      >
        {changeRole.isPending ? '변경하는 중…' : TEAM_MEMBER_ROLE_LABEL[role]}
        <ChevronDownIcon size={14} />
      </button>
    </div>
  );
}
