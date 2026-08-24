'use client';

import { type SyntheticEvent, useState } from 'react';

import { useUpdateTeam } from '@/features/team-settings/model/use-update-team';
import { type Team } from '@/entities/team/model/team';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';

export interface TeamProfileFormProps {
  team: Team;
}

export function TeamProfileForm({ team }: TeamProfileFormProps) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? '');
  const [saved, setSaved] = useState(false);
  const updateTeam = useUpdateTeam(team.id);

  const trimmedName = name.trim();
  const dirty =
    trimmedName !== team.name || description !== (team.description ?? '');
  const canSubmit = trimmedName.length > 0 && dirty && !updateTeam.isPending;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSaved(false);
    updateTeam.mutate(
      { name: trimmedName, description: description.trim() || null },
      { onSuccess: () => setSaved(true) },
    );
  };

  const handleReset = () => {
    setName(team.name);
    setDescription(team.description ?? '');
    setSaved(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <TextField
        label="팀 이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="팀 이름을 입력하세요"
        maxLength={50}
      />
      <TextField
        label="팀 설명"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="팀을 한 줄로 소개해 보세요 (선택)"
        maxLength={100}
      />
      {updateTeam.isError && (
        <p className="typography-subtext-medium text-error">
          저장하지 못했어요. 다시 시도해 주세요.
        </p>
      )}
      {saved && !dirty && (
        <p className="typography-subtext-medium text-success">저장했어요.</p>
      )}
      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={!dirty || updateTeam.isPending}
          onClick={handleReset}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          저장
        </Button>
      </div>
    </form>
  );
}
