'use client';

import { type ChangeEvent, useRef, useState } from 'react';

import { useDeleteTeamIcon } from '@/features/team-icon/model/use-delete-team-icon';
import { useUpdateTeamIcon } from '@/features/team-icon/model/use-update-team-icon';
import { type Team } from '@/entities/team/model/team';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024;

export interface TeamIconFieldProps {
  team: Team;
}

export function TeamIconField({ team }: TeamIconFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const updateIcon = useUpdateTeamIcon(team.id);
  const deleteIcon = useDeleteTeamIcon(team.id);

  const pending = updateIcon.isPending || deleteIcon.isPending;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('JPG 또는 PNG 이미지만 올릴 수 있어요.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('5MB 이하 이미지만 올릴 수 있어요.');
      return;
    }

    setError('');
    updateIcon.mutate(file, {
      onError: () => setError('아이콘을 올리지 못했어요. 다시 시도해 주세요.'),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-[18px]">
        <Avatar
          src={team.iconUrl ?? undefined}
          name={team.name}
          size={80}
          loading="eager"
        />
        <div className="flex flex-col gap-2">
          <div className="flex gap-2.5">
            <Button
              size="S"
              variant="weak"
              color="neutral"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              아이콘 변경
            </Button>
            <Button
              size="S"
              variant="weak"
              color="neutral"
              disabled={pending || !team.iconUrl}
              onClick={() =>
                deleteIcon.mutate(undefined, {
                  onError: () =>
                    setError('아이콘을 지우지 못했어요. 다시 시도해 주세요.'),
                })
              }
            >
              제거
            </Button>
          </div>
          <p className="typography-subtext-small text-on-surface-variant">
            최소 512x512, JPG·PNG, 최대 5MB
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="typography-subtext-medium text-error">{error}</p>}
    </div>
  );
}
