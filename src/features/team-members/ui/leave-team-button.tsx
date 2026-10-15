'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useLeaveTeam } from '@/features/team-members/model/use-leave-team';
import { HOME_PATH } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

export interface LeaveTeamButtonProps {
  teamId: number;
  myUserId: number;
}

export function LeaveTeamButton({ teamId, myUserId }: LeaveTeamButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const leaveTeam = useLeaveTeam(teamId);

  const handleClose = () => {
    setConfirmOpen(false);
    leaveTeam.reset();
  };

  const handleLeave = () => {
    leaveTeam.mutate(myUserId, {
      onSuccess: () => {
        setConfirmOpen(false);
        router.push(HOME_PATH);
      },
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="팀 나가기"
        onClick={() => setConfirmOpen(true)}
        className="shrink-0 cursor-pointer rounded-full px-3 py-1.5 typography-subtext-small text-on-surface-variant hover:bg-surface-container-high hover:text-error"
      >
        나가기
      </button>

      <Dialog
        open={confirmOpen}
        onClose={handleClose}
        title="팀에서 나갈까요?"
        description={
          leaveTeam.isError
            ? '팀을 나가지 못했어요. 잠시 후 다시 시도해 주세요.'
            : '팀의 모든 채널과 대화에 접근할 수 없게 되며, 다시 참여하려면 초대를 받아야 합니다.'
        }
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={leaveTeam.isPending}
          onClick={handleClose}
        >
          취소
        </Button>
        <Button
          type="button"
          color="danger"
          disabled={leaveTeam.isPending}
          onClick={handleLeave}
        >
          {leaveTeam.isPending ? '나가는 중…' : '나가기'}
        </Button>
      </Dialog>
    </>
  );
}
