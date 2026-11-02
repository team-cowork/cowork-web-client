'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { type Project } from '@/entities/project/model/project';
import { useDeleteProject } from '@/features/project-settings/model/use-delete-project';
import { useUpdateProject } from '@/features/project-settings/model/use-update-project';
import { EditProjectModal } from '@/features/project-settings/ui/edit-project-modal';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { IconButton } from '@/shared/ui/icon-button';
import { ArchiveIcon } from '@/shared/ui/icons/archive-icon';
import { EditIcon } from '@/shared/ui/icons/edit-icon';
import { MoreIcon } from '@/shared/ui/icons/more-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { Menu, MenuSeparator } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';

export interface ProjectSettingsMenuProps {
  project: Project;
  /** 순서 변경처럼 다른 기능이 덧붙이는 메뉴 항목. 누르면 메뉴가 닫힌다. */
  extraItems?: ReactNode;
}

/** 프로젝트 소유자가 정보 수정·보관·삭제를 하는 메뉴 */
export function ProjectSettingsMenu({
  project,
  extraItems,
}: ProjectSettingsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateProject = useUpdateProject(project.teamId, project.id);
  const deleteProject = useDeleteProject(project.teamId, project.id);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const isArchived = project.status === 'ARCHIVED';

  return (
    <div className="relative">
      <IconButton
        aria-label="프로젝트 메뉴"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        size="S"
        variant="border"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <MoreIcon size={16} />
      </IconButton>

      {menuOpen && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute top-full right-0 z-50 mt-2"
            onClick={() => setMenuOpen(false)}
          >
            <Menu>
              <MenuItem
                icon={<EditIcon size={16} />}
                onClick={() => setEditOpen(true)}
              >
                정보 수정
              </MenuItem>
              <MenuItem
                icon={<ArchiveIcon size={16} />}
                disabled={updateProject.isPending}
                onClick={() =>
                  updateProject.mutate({
                    status: isArchived ? 'ACTIVE' : 'ARCHIVED',
                  })
                }
              >
                {isArchived ? '보관 해제' : '보관'}
              </MenuItem>
              {extraItems && (
                <>
                  <MenuSeparator />
                  {extraItems}
                </>
              )}
              <MenuSeparator />
              <MenuItem
                icon={<TrashIcon size={16} />}
                danger
                onClick={() => setDeleteOpen(true)}
              >
                프로젝트 삭제
              </MenuItem>
            </Menu>
          </div>
        </>
      )}

      <EditProjectModal
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
      />

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="프로젝트를 삭제할까요?"
        description={
          deleteProject.isError
            ? '삭제하지 못했어요. 프로젝트 소유자만 삭제할 수 있어요.'
            : `"${project.name}" 프로젝트가 삭제되고 되돌릴 수 없어요.`
        }
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={deleteProject.isPending}
          onClick={() => setDeleteOpen(false)}
        >
          취소
        </Button>
        <Button
          type="button"
          color="danger"
          disabled={deleteProject.isPending}
          onClick={() => deleteProject.mutate()}
        >
          {deleteProject.isPending ? '삭제하는 중…' : '삭제'}
        </Button>
      </Dialog>
    </div>
  );
}
