'use client';

import { type KeyboardEvent, type SyntheticEvent, useState } from 'react';

import { useCreateTeamRole } from '@/features/team-roles/model/use-create-team-role';
import { Button } from '@/shared/ui/button';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { Modal } from '@/shared/ui/modal';
import { SettingRow } from '@/shared/ui/setting-row';
import { Switch } from '@/shared/ui/switch';
import { TextField } from '@/shared/ui/text-field';

const DEFAULT_COLOR_HEX = '#5865F2';

export interface CreateTeamRoleModalProps {
  open: boolean;
  teamId: number;
  onClose: () => void;
}

export function CreateTeamRoleModal({
  open,
  teamId,
  onClose,
}: CreateTeamRoleModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="역할 만들기"
      className="w-[520px]"
    >
      {open ? (
        <CreateTeamRoleForm teamId={teamId} onClose={onClose} />
      ) : undefined}
    </Modal>
  );
}

function CreateTeamRoleForm({
  teamId,
  onClose,
}: {
  teamId: number;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [colorHex, setColorHex] = useState(DEFAULT_COLOR_HEX);
  const [priority, setPriority] = useState('0');
  const [mentionable, setMentionable] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionInput, setPermissionInput] = useState('');

  const createRole = useCreateTeamRole(teamId);

  const trimmedName = name.trim();
  const priorityNumber = Number(priority);
  const validPriority = Number.isInteger(priorityNumber);
  const canSubmit =
    trimmedName.length > 0 && validPriority && !createRole.isPending;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    createRole.mutate(
      {
        name: trimmedName,
        colorHex,
        priority: priorityNumber,
        mentionable,
        permissions,
      },
      { onSuccess: onClose },
    );
  };

  const addPermission = () => {
    const value = permissionInput.trim();
    if (!value || permissions.includes(value)) {
      setPermissionInput('');
      return;
    }
    setPermissions((prev) => [...prev, value]);
    setPermissionInput('');
  };

  const handlePermissionKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addPermission();
  };

  const removePermission = (value: string) => {
    setPermissions((prev) => prev.filter((p) => p !== value));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="flex gap-3">
        <TextField
          label="역할 이름"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="새 역할"
          maxLength={50}
          autoFocus
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

      <TextField
        label="우선순위"
        type="number"
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
        error={!validPriority ? '정수를 입력하세요' : undefined}
      />

      <SettingRow
        label="멘션 허용"
        description="이 역할을 멘션으로 호출할 수 있게 해요"
      >
        <Switch checked={mentionable} onCheckedChange={setMentionable} />
      </SettingRow>

      <div className="flex flex-col gap-2">
        <label className="typography-label-x-small text-on-surface-variant">
          권한
        </label>
        {permissions.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {permissions.map((permission) => (
              <li key={permission}>
                <button
                  type="button"
                  onClick={() => removePermission(permission)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-surface-container py-1 pr-2 pl-2.5 text-on-surface hover:bg-surface-container-high"
                >
                  <span className="typography-subtext-medium">
                    {permission}
                  </span>
                  <CloseIcon size={12} className="text-on-surface-variant" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <TextField
            value={permissionInput}
            onChange={(event) => setPermissionInput(event.target.value)}
            onKeyDown={handlePermissionKeyDown}
            placeholder="권한 코드를 입력하고 Enter"
            className="flex-1"
          />
          <Button
            type="button"
            size="S"
            variant="weak"
            color="neutral"
            onClick={addPermission}
          >
            추가
          </Button>
        </div>
      </div>

      {createRole.isError && (
        <p className="typography-subtext-medium text-error">
          역할을 만들지 못했어요. 다시 시도해 주세요.
        </p>
      )}

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={createRole.isPending}
          onClick={onClose}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {createRole.isPending ? '만드는 중…' : '만들기'}
        </Button>
      </div>
    </form>
  );
}
