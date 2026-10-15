'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useDeleteTeam } from '@/features/team-settings/model/use-delete-team';
import { type Team } from '@/entities/team/model/team';
import { HOME_PATH } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { SettingsCard } from '@/shared/ui/settings-card';

export interface DeleteTeamSectionProps {
  team: Team;
}

export function DeleteTeamSection({ team }: DeleteTeamSectionProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteTeam = useDeleteTeam();

  const handleDelete = () => {
    deleteTeam.mutate(team.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        router.push(HOME_PATH);
      },
    });
  };

  return (
    <SettingsCard title="위험 구역">
      <div className="flex items-center justify-between gap-4">
        <p className="typography-subtext-medium text-on-surface-variant">
          팀과 모든 채널·멤버·역할이 영구적으로 삭제됩니다.
        </p>
        <Button
          type="button"
          variant="weak"
          color="danger"
          onClick={() => setConfirmOpen(true)}
        >
          팀 삭제
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="팀을 삭제할까요?"
        description={`"${team.name}" 팀과 모든 채널·대화·멤버 정보가 삭제되며, 되돌릴 수 없습니다.`}
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={deleteTeam.isPending}
          onClick={() => setConfirmOpen(false)}
        >
          취소
        </Button>
        <Button
          type="button"
          color="danger"
          disabled={deleteTeam.isPending}
          onClick={handleDelete}
        >
          {deleteTeam.isPending ? '삭제하는 중…' : '삭제'}
        </Button>
      </Dialog>
    </SettingsCard>
  );
}
