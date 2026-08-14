'use client';

import { type SyntheticEvent, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useCreateChannel } from '@/features/channel-create/model/use-create-channel';
import {
  CHANNEL_VIEW_TYPES,
  CHANNEL_VIEW_TYPE_DESCRIPTION,
  CHANNEL_VIEW_TYPE_LABEL,
  CHANNEL_VIEW_TYPE_TO_TYPE,
  type ChannelViewType,
} from '@/entities/channel/model/channel';
import { ChannelIcon } from '@/entities/channel/ui/channel-icon';
import { channelPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { GlobeIcon } from '@/shared/ui/icons/globe-icon';
import { LockIcon } from '@/shared/ui/icons/lock-icon';
import { Modal } from '@/shared/ui/modal';
import { OptionCard } from '@/shared/ui/option-card';
import { TextField } from '@/shared/ui/text-field';

export interface CreateChannelModalProps {
  open: boolean;
  teamId: number;
  onClose: () => void;
}

export function CreateChannelModal({ open, teamId, onClose }: CreateChannelModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="채널 만들기" className="w-[520px]">
      {open ? <CreateChannelForm teamId={teamId} onClose={onClose} /> : undefined}
    </Modal>
  );
}

function CreateChannelForm({ teamId, onClose }: { teamId: number; onClose: () => void }) {
  const router = useRouter();
  const createChannel = useCreateChannel(teamId);
  const [viewType, setViewType] = useState<ChannelViewType>('TEXT');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !createChannel.isPending;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    createChannel.mutate(
      {
        teamId,
        name: trimmedName,
        type: CHANNEL_VIEW_TYPE_TO_TYPE[viewType],
        viewType,
        isPrivate,
        description: description.trim() || null,
      },
      {
        onSuccess: (channel) => {
          onClose();
          router.push(channelPath(teamId, channel.id));
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="typography-label-x-small text-on-surface-variant mb-2">채널 유형</legend>
        <div className="grid grid-cols-2 gap-2">
          {CHANNEL_VIEW_TYPES.map((candidate) => (
            <OptionCard
              key={candidate}
              label={CHANNEL_VIEW_TYPE_LABEL[candidate]}
              description={CHANNEL_VIEW_TYPE_DESCRIPTION[candidate]}
              icon={<ChannelIcon viewType={candidate} size={18} />}
              selected={candidate === viewType}
              onClick={() => setViewType(candidate)}
            />
          ))}
        </div>
      </fieldset>

      <TextField
        label="채널 이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="새-채널"
        maxLength={50}
        autoFocus
      />

      <TextField
        label="채널 설명"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="채널 주제를 한 줄로 적어보세요 (선택)"
        maxLength={100}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="typography-label-x-small text-on-surface-variant mb-2">공개 범위</legend>
        <div className="grid grid-cols-2 gap-2">
          <OptionCard
            label="공개"
            description="팀 전체 접근"
            icon={<GlobeIcon size={18} />}
            selected={!isPrivate}
            onClick={() => setIsPrivate(false)}
          />
          <OptionCard
            label="비공개"
            description="초대된 멤버만"
            icon={<LockIcon size={18} />}
            selected={isPrivate}
            onClick={() => setIsPrivate(true)}
          />
        </div>
      </fieldset>

      {createChannel.isError && (
        <p className="text-error typography-subtext-medium">
          채널을 만들지 못했어요. 다시 시도해 주세요.
        </p>
      )}

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={createChannel.isPending}
          onClick={onClose}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {createChannel.isPending ? '만드는 중…' : '만들기'}
        </Button>
      </div>
    </form>
  );
}
