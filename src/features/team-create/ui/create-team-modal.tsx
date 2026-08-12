'use client';

import { type SyntheticEvent, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useCreateTeam } from '@/features/team-create/model/use-create-team';
import { teamPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { TextField } from '@/shared/ui/text-field';

export interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTeamModal({ open, onClose }: CreateTeamModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="팀 만들기">
      {open ? <CreateTeamForm onClose={onClose} /> : undefined}
    </Modal>
  );
}

function CreateTeamForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const createTeam = useCreateTeam();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !createTeam.isPending;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    createTeam.mutate(
      { name: trimmedName, description: description.trim() || null },
      {
        onSuccess: (team) => {
          onClose();
          router.push(teamPath(team.id));
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <TextField
        label="팀 이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="팀 이름을 입력하세요"
        maxLength={50}
        autoFocus
      />
      <TextField
        label="팀 설명"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="팀을 한 줄로 소개해 보세요 (선택)"
        maxLength={100}
      />
      {createTeam.isError && (
        <p className="text-error typography-subtext-medium">
          팀을 만들지 못했어요. 다시 시도해 주세요.
        </p>
      )}
      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={createTeam.isPending}
          onClick={onClose}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {createTeam.isPending ? '만드는 중…' : '만들기'}
        </Button>
      </div>
    </form>
  );
}
