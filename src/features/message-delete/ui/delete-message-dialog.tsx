'use client';

import { type Message } from '@/entities/message/model/message';
import { useDeleteMessage } from '@/features/message-delete/model/use-delete-message';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

export interface DeleteMessageDialogProps {
  message: Message;
  open: boolean;
  onClose: () => void;
}

export function DeleteMessageDialog({
  message,
  open,
  onClose,
}: DeleteMessageDialogProps) {
  const { mutate, isPending, isError } = useDeleteMessage(message);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="메시지를 삭제할까요?"
      description={
        isError
          ? '삭제에 실패했어요. 잠시 후 다시 시도해 주세요.'
          : '삭제한 메시지는 되돌릴 수 없어요.'
      }
    >
      <Button
        type="button"
        variant="weak"
        color="neutral"
        disabled={isPending}
        onClick={onClose}
      >
        취소
      </Button>
      <Button
        type="button"
        color="danger"
        disabled={isPending}
        onClick={() => mutate(undefined, { onSuccess: onClose })}
      >
        {isPending ? '삭제하는 중…' : '삭제'}
      </Button>
    </Dialog>
  );
}
