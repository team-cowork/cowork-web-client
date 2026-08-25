'use client';

import { type SyntheticEvent, useState } from 'react';

import { useUpdateChannel } from '@/features/channel-settings/model/use-update-channel';
import { type Channel } from '@/entities/channel/model/channel';
import { Button } from '@/shared/ui/button';
import { GlobeIcon } from '@/shared/ui/icons/globe-icon';
import { LockIcon } from '@/shared/ui/icons/lock-icon';
import { OptionCard } from '@/shared/ui/option-card';
import { TextField } from '@/shared/ui/text-field';

export interface ChannelOverviewFormProps {
  teamId: number;
  channel: Channel;
}

export function ChannelOverviewForm({
  teamId,
  channel,
}: ChannelOverviewFormProps) {
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description ?? '');
  const [isPrivate, setIsPrivate] = useState(channel.isPrivate);

  const updateChannel = useUpdateChannel(channel.id, teamId);

  const trimmedName = name.trim();
  const dirty =
    trimmedName !== channel.name ||
    description !== (channel.description ?? '') ||
    isPrivate !== channel.isPrivate;
  const canSubmit = trimmedName.length > 0 && dirty && !updateChannel.isPending;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    updateChannel.mutate({
      name: trimmedName,
      description: description.trim() || null,
      isPrivate,
    });
  };

  const handleReset = () => {
    setName(channel.name);
    setDescription(channel.description ?? '');
    setIsPrivate(channel.isPrivate);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <TextField
        label="채널 이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="새-채널"
        maxLength={50}
      />

      <TextField
        label="채널 설명"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="채널 주제를 한 줄로 적어보세요 (선택)"
        maxLength={100}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 typography-label-x-small text-on-surface-variant">
          공개 범위
        </legend>
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

      {updateChannel.isError && (
        <p className="typography-subtext-medium text-error">
          채널을 수정하지 못했어요. 다시 시도해 주세요.
        </p>
      )}

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={!dirty || updateChannel.isPending}
          onClick={handleReset}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {updateChannel.isPending ? '저장하는 중…' : '저장'}
        </Button>
      </div>
    </form>
  );
}
