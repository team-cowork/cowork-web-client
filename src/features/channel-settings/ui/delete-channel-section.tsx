'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useDeleteChannel } from '@/features/channel-settings/model/use-delete-channel';
import { type Channel } from '@/entities/channel/model/channel';
import { teamPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { SettingsCard } from '@/shared/ui/settings-card';

export interface DeleteChannelSectionProps {
  teamId: number;
  channel: Channel;
}

export function DeleteChannelSection({
  teamId,
  channel,
}: DeleteChannelSectionProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteChannel = useDeleteChannel(teamId);

  const handleDelete = () => {
    deleteChannel.mutate(channel.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        router.push(teamPath(teamId));
      },
    });
  };

  return (
    <SettingsCard title="위험 구역">
      <div className="flex items-center justify-between gap-4">
        <p className="typography-subtext-medium text-on-surface-variant">
          채널과 모든 대화 내용이 영구적으로 삭제됩니다.
        </p>
        <Button
          type="button"
          variant="weak"
          color="danger"
          onClick={() => setConfirmOpen(true)}
        >
          채널 삭제
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="채널을 삭제할까요?"
        description={`"${channel.name}" 채널과 모든 대화 내용이 삭제되며, 되돌릴 수 없습니다.`}
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={deleteChannel.isPending}
          onClick={() => setConfirmOpen(false)}
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
    </SettingsCard>
  );
}
