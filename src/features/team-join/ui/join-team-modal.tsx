'use client';

import { type SyntheticEvent, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useJoinTeam } from '@/features/team-join/model/use-join-team';
import { teamPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { TextField } from '@/shared/ui/text-field';

export interface JoinTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export function JoinTeamModal({ open, onClose }: JoinTeamModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="초대 코드로 참여하기"
      className="w-[440px]"
    >
      {open ? <JoinTeamForm onClose={onClose} /> : undefined}
    </Modal>
  );
}

function JoinTeamForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const joinTeam = useJoinTeam();

  const trimmedCode = inviteCode.trim();
  const canSubmit = trimmedCode.length > 0 && !joinTeam.isPending;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    joinTeam.mutate(trimmedCode, {
      onSuccess: ({ teamId }) => {
        onClose();
        router.push(teamPath(teamId));
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <TextField
        label="초대 코드"
        value={inviteCode}
        onChange={(event) => setInviteCode(event.target.value)}
        placeholder="초대 코드를 입력하세요"
        maxLength={50}
        autoFocus
      />

      {joinTeam.isError && (
        <p className="typography-subtext-medium text-error">
          초대 코드가 올바르지 않거나 만료됐어요. 다시 확인해 주세요.
        </p>
      )}

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={joinTeam.isPending}
          onClick={onClose}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {joinTeam.isPending ? '참여하는 중…' : '참여하기'}
        </Button>
      </div>
    </form>
  );
}
