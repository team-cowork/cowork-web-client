'use client';

import { type SyntheticEvent, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useCreateProject } from '@/features/project-create/model/use-create-project';
import { projectPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { TextField } from '@/shared/ui/text-field';

export interface CreateProjectModalProps {
  open: boolean;
  teamId: number;
  onClose: () => void;
}

export function CreateProjectModal({
  open,
  teamId,
  onClose,
}: CreateProjectModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="프로젝트 만들기"
      className="w-[480px]"
    >
      {open ? (
        <CreateProjectForm teamId={teamId} onClose={onClose} />
      ) : undefined}
    </Modal>
  );
}

function CreateProjectForm({
  teamId,
  onClose,
}: {
  teamId: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const createProject = useCreateProject(teamId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !createProject.isPending;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    createProject.mutate(
      {
        teamId,
        name: trimmedName,
        description: description.trim() || null,
      },
      {
        onSuccess: (project) => {
          onClose();
          router.push(projectPath(teamId, project.id));
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="프로젝트 이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="새 프로젝트"
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

      {createProject.isError && (
        <p className="typography-subtext-medium text-error">
          프로젝트를 만들지 못했어요. 다시 시도해 주세요.
        </p>
      )}

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={createProject.isPending}
          onClick={onClose}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {createProject.isPending ? '만드는 중…' : '만들기'}
        </Button>
      </div>
    </form>
  );
}
