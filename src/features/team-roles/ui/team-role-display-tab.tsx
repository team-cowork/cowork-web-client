'use client';

import { type SyntheticEvent, useState } from 'react';

import { useUpdateTeamRole } from '@/features/team-roles/model/use-update-team-role';
import { type TeamRole } from '@/entities/team/model/team';
import { Button } from '@/shared/ui/button';
import { SettingRow } from '@/shared/ui/setting-row';
import { Switch } from '@/shared/ui/switch';
import { TextField } from '@/shared/ui/text-field';

export interface TeamRoleDisplayTabProps {
  teamId: number;
  role: TeamRole;
}

export function TeamRoleDisplayTab({ teamId, role }: TeamRoleDisplayTabProps) {
  const [name, setName] = useState(role.name);
  const [colorHex, setColorHex] = useState(role.colorHex);
  const [mentionable, setMentionable] = useState(role.mentionable);

  const updateRole = useUpdateTeamRole(teamId);

  const trimmedName = name.trim();
  const dirty =
    trimmedName !== role.name ||
    colorHex !== role.colorHex ||
    mentionable !== role.mentionable;
  const canSubmit = trimmedName.length > 0 && dirty && !updateRole.isPending;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    updateRole.mutate({
      roleId: role.id,
      request: { name: trimmedName, colorHex, mentionable },
    });
  };

  const handleReset = () => {
    setName(role.name);
    setColorHex(role.colorHex);
    setMentionable(role.mentionable);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="flex gap-3">
        <TextField
          label="역할 이름"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={50}
          className="flex-1"
        />
        <div className="flex flex-col gap-2">
          <label className="typography-label-x-small text-on-surface-variant">
            색상
          </label>
          <div className="flex h-12 items-center gap-2">
            <span
              aria-hidden
              className="size-6 shrink-0 rounded-full border border-outline-variant"
              style={{ backgroundColor: colorHex }}
            />
            <TextField
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value)}
              placeholder="#5865F2"
              maxLength={7}
              className="w-28"
            />
          </div>
        </div>
      </div>

      <SettingRow
        label="멘션 허용"
        description="이 역할을 멘션으로 호출할 수 있게 해요"
      >
        <Switch checked={mentionable} onCheckedChange={setMentionable} />
      </SettingRow>

      {updateRole.isError && (
        <p className="typography-subtext-medium text-error">
          저장하지 못했어요. 다시 시도해 주세요.
        </p>
      )}

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={!dirty || updateRole.isPending}
          onClick={handleReset}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {updateRole.isPending ? '저장하는 중…' : '저장'}
        </Button>
      </div>
    </form>
  );
}
