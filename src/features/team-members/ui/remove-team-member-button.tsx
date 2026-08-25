'use client';

import { useState } from 'react';

import { useRemoveTeamMember } from '@/features/team-members/model/use-remove-team-member';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

export interface RemoveTeamMemberButtonProps {
  teamId: number;
  targetUserId: number;
  memberName: string;
}

export function RemoveTeamMemberButton({
  teamId,
  targetUserId,
  memberName,
}: RemoveTeamMemberButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeMember = useRemoveTeamMember(teamId);

  return (
    <>
      <button
        type="button"
        aria-label={`${memberName} 추방`}
        onClick={() => setConfirmOpen(true)}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-error"
      >
        <CloseIcon size={16} />
      </button>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="멤버를 추방할까요?"
        description={`"${memberName}"님이 팀에서 제거되고, 모든 채널·역할 접근 권한을 잃습니다.`}
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={removeMember.isPending}
          onClick={() => setConfirmOpen(false)}
        >
          취소
        </Button>
        <Button
          type="button"
          color="danger"
          disabled={removeMember.isPending}
          onClick={() =>
            removeMember.mutate(targetUserId, {
              onSuccess: () => setConfirmOpen(false),
            })
          }
        >
          {removeMember.isPending ? '추방하는 중…' : '추방'}
        </Button>
      </Dialog>
    </>
  );
}
