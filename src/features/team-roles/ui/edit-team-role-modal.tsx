'use client';

import { type SyntheticEvent, useState } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import { useAssignTeamRole } from '@/features/team-roles/model/use-assign-team-role';
import { useDeleteTeamRole } from '@/features/team-roles/model/use-delete-team-role';
import { useUnassignTeamRole } from '@/features/team-roles/model/use-unassign-team-role';
import { useUpdateTeamRole } from '@/features/team-roles/model/use-update-team-role';
import { teamQueries } from '@/entities/team/api/team-queries';
import { type TeamMember, type TeamRole } from '@/entities/team/model/team';
import { userQueries } from '@/entities/user/api/user-queries';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Modal } from '@/shared/ui/modal';
import { SettingRow } from '@/shared/ui/setting-row';
import { Switch } from '@/shared/ui/switch';
import { TextField } from '@/shared/ui/text-field';

export interface EditTeamRoleModalProps {
  teamId: number;
  role: TeamRole | null;
  onClose: () => void;
}

export function EditTeamRoleModal({
  teamId,
  role,
  onClose,
}: EditTeamRoleModalProps) {
  return (
    <Modal
      open={role !== null}
      onClose={onClose}
      title="역할 관리"
      className="w-[560px]"
    >
      {role ? (
        <EditTeamRoleForm teamId={teamId} role={role} onClose={onClose} />
      ) : undefined}
    </Modal>
  );
}

function EditTeamRoleForm({
  teamId,
  role,
  onClose,
}: {
  teamId: number;
  role: TeamRole;
  onClose: () => void;
}) {
  const [name, setName] = useState(role.name);
  const [colorHex, setColorHex] = useState(role.colorHex);
  const [mentionable, setMentionable] = useState(role.mentionable);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const updateRole = useUpdateTeamRole(teamId);
  const deleteRole = useDeleteTeamRole(teamId);

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
      request: {
        name: trimmedName,
        colorHex,
        mentionable,
      },
    });
  };

  const handleDelete = () => {
    deleteRole.mutate(role.id, { onSuccess: onClose });
  };

  return (
    <div className="flex flex-col gap-5">
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

        <div className="flex items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="weak"
            color="danger"
            disabled={deleteRole.isPending}
            onClick={() => setDeleteConfirmOpen(true)}
          >
            역할 삭제
          </Button>
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="weak"
              color="neutral"
              disabled={!dirty || updateRole.isPending}
              onClick={() => {
                setName(role.name);
                setColorHex(role.colorHex);
                setMentionable(role.mentionable);
              }}
            >
              취소
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {updateRole.isPending ? '저장하는 중…' : '저장'}
            </Button>
          </div>
        </div>
      </form>

      <TeamRoleMembers teamId={teamId} role={role} />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="역할을 삭제할까요?"
        description={`"${role.name}" 역할이 삭제되고, 이 역할을 가진 모든 멤버에게서 제거됩니다.`}
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={deleteRole.isPending}
          onClick={() => setDeleteConfirmOpen(false)}
        >
          취소
        </Button>
        <Button
          type="button"
          color="danger"
          disabled={deleteRole.isPending}
          onClick={handleDelete}
        >
          {deleteRole.isPending ? '삭제하는 중…' : '삭제'}
        </Button>
      </Dialog>
    </div>
  );
}

function memberDisplayName(
  member: TeamMember,
  user: { nickname: string | null; name: string } | undefined,
): string {
  if (user) return user.nickname ?? user.name;
  return `사용자 #${member.userId}`;
}

function TeamRoleMembers({ teamId, role }: { teamId: number; role: TeamRole }) {
  const [keyword, setKeyword] = useState('');
  const { data: members = [] } = useQuery(teamQueries.members(teamId));
  const userResults = useQueries({
    queries: members.map((member) => userQueries.detail(member.userId)),
  });
  const usersByUserId = new Map(
    members.map((member, index) => [member.userId, userResults[index]?.data]),
  );

  const assignRole = useAssignTeamRole(teamId);
  const unassignRole = useUnassignTeamRole(teamId);

  const holders = members.filter((member) =>
    member.roles.some((r) => r.id === role.id),
  );
  const holderIds = new Set(holders.map((member) => member.userId));

  const trimmedKeyword = keyword.trim().toLowerCase();
  const candidates =
    trimmedKeyword.length === 0
      ? []
      : members.filter((member) => {
          if (holderIds.has(member.userId)) return false;
          const user = usersByUserId.get(member.userId);
          const label = memberDisplayName(member, user).toLowerCase();
          return label.includes(trimmedKeyword);
        });

  return (
    <div className="flex flex-col gap-2.5 border-t border-outline-variant pt-4">
      <h3 className="typography-label-x-small text-on-surface-variant">
        이 역할을 가진 멤버 — {holders.length}명
      </h3>

      {holders.length > 0 && (
        <ul className="flex flex-col gap-1">
          {holders.map((member) => {
            const user = usersByUserId.get(member.userId);

            return (
              <li key={member.id}>
                <div className="flex h-11 items-center gap-2.5 rounded-lg px-2 hover:bg-surface-container">
                  <UserAvatar user={user} size={24} />
                  <span className="min-w-0 flex-1 truncate typography-label-x-small text-on-surface">
                    {memberDisplayName(member, user)}
                  </span>
                  <button
                    type="button"
                    disabled={unassignRole.isPending}
                    onClick={() =>
                      unassignRole.mutate({
                        targetUserId: member.userId,
                        roleId: role.id,
                      })
                    }
                    className="shrink-0 cursor-pointer typography-subtext-small text-on-surface-variant hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    회수
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <TextField
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="이름으로 검색해서 역할 부여"
      />

      {candidates.length > 0 && (
        <ul className="flex flex-col gap-1">
          {candidates.map((member) => {
            const user = usersByUserId.get(member.userId);

            return (
              <li key={member.id}>
                <button
                  type="button"
                  disabled={assignRole.isPending}
                  onClick={() => {
                    assignRole.mutate({
                      targetUserId: member.userId,
                      roleId: role.id,
                    });
                    setKeyword('');
                  }}
                  className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 text-left hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserAvatar user={user} size={24} />
                  <span className="min-w-0 flex-1 truncate typography-label-x-small text-on-surface">
                    {memberDisplayName(member, user)}
                  </span>
                  <span className="shrink-0 typography-subtext-small text-primary">
                    부여
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
