'use client';

import { type SyntheticEvent, useState } from 'react';

import { type Project } from '@/entities/project/model/project';
import { useUpdateProject } from '@/features/project-settings/model/use-update-project';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { TextField } from '@/shared/ui/text-field';

export interface EditProjectModalProps {
  open: boolean;
  project: Project;
  onClose: () => void;
}

export function EditProjectModal({
  open,
  project,
  onClose,
}: EditProjectModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="프로젝트 정보 수정"
      className="w-[480px]"
    >
      {open ? (
        <EditProjectForm project={project} onClose={onClose} />
      ) : undefined}
    </Modal>
  );
}

function EditProjectForm({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const updateProject = useUpdateProject(project.teamId, project.id);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !updateProject.isPending;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    updateProject.mutate(
      { name: trimmedName, description: description.trim() || null },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="프로젝트 이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={50}
        autoFocus
      />

      <TextField
        label="프로젝트 설명"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="어떤 프로젝트인지 한 줄로 적어보세요 (선택)"
        maxLength={200}
      />

      {updateProject.isError && (
        <p className="typography-subtext-medium text-error">
          저장하지 못했어요. 프로젝트 소유자만 수정할 수 있어요.
        </p>
      )}

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={updateProject.isPending}
          onClick={onClose}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {updateProject.isPending ? '저장하는 중…' : '저장'}
        </Button>
      </div>
    </form>
  );
}
