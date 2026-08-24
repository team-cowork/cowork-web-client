'use client';

import { useRouter } from 'next/navigation';

import { useDeleteChannel } from '@/features/channel-settings/model/use-delete-channel';
import { type Channel } from '@/entities/channel/model/channel';
import { teamPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

export interface DeleteChannelDialogProps {
  open: boolean;
  teamId: number;
  channel: Channel;
  onClose: () => void;
}

export function DeleteChannelDialog({
  open,
  teamId,
  channel,
  onClose,
}: DeleteChannelDialogProps) {
  const router = useRouter();
  const deleteChannel = useDeleteChannel(teamId);

  const handleDelete = () => {
    if (deleteChannel.isPending) return;

    deleteChannel.mutate(channel.id, {
      onSuccess: () => {
        onClose();
        router.push(teamPath(teamId));
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="채널을 삭제할까요?"
      description={`"${channel.name}" 채널과 모든 대화 내용이 삭제되며, 되돌릴 수 없습니다.`}
    >
      <Button
        type="button"
        variant="weak"
        color="neutral"
        disabled={deleteChannel.isPending}
        onClick={onClose}
      >
        취소
      </Button>
      <Button
        type="button"
        color="danger"
        disabled={deleteChannel.isPending}
        onClick={handleDelete}
      >
        {deleteChannel.isPending ? '삭제하는 중…' : '삭제'}
      </Button>
    </Dialog>
  );
}
