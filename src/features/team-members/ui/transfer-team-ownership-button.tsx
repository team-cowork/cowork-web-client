'use client';

import { useState } from 'react';

import { useTransferTeamOwnership } from '@/features/team-members/model/use-transfer-team-ownership';
import { getHttpErrorMessage } from '@/shared/api/http-error';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

export interface TransferTeamOwnershipButtonProps {
  teamId: number;
  targetUserId: number;
  memberName: string;
}

export function TransferTeamOwnershipButton({
  teamId,
  targetUserId,
  memberName,
}: TransferTeamOwnershipButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const transfer = useTransferTeamOwnership(teamId);

  const close = () => {
    if (transfer.isPending) return;
    setConfirmOpen(false);
    transfer.reset();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="flex h-8 shrink-0 cursor-pointer items-center rounded-lg px-2.5 typography-subtext-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
      >
        소유권 이양
      </button>

      <Dialog
        open={confirmOpen}
        onClose={close}
        title="소유권을 넘길까요?"
        description={
          transfer.isError
            ? getHttpErrorMessage(
                transfer.error,
                '소유권을 넘기지 못했어요. 잠시 후 다시 시도해 주세요.',
              )
            : `"${memberName}"님이 팀 소유자가 되고, 나는 소유자 권한을 잃습니다. 되돌리려면 새 소유자가 다시 넘겨 줘야 해요.`
        }
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={transfer.isPending}
          onClick={close}
        >
          취소
        </Button>
        <Button
          type="button"
          color="danger"
          disabled={transfer.isPending}
          onClick={() =>
            transfer.mutate(targetUserId, {
              onSuccess: () => setConfirmOpen(false),
            })
          }
        >
          {transfer.isPending ? '넘기는 중…' : '소유권 이양'}
        </Button>
      </Dialog>
    </>
  );
}
