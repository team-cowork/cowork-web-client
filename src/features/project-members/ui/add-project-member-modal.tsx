'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  ASSIGNABLE_PROJECT_MEMBER_ROLES,
  type AssignableProjectMemberRole,
  PROJECT_MEMBER_ROLE_LABEL,
  type ProjectMember,
} from '@/entities/project/model/project';
import { teamQueries } from '@/entities/team/api/team-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { useAddProjectMember } from '@/features/project-members/model/use-add-project-member';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { SegmentedControl } from '@/shared/ui/segmented-control';

export interface AddProjectMemberModalProps {
  open: boolean;
  teamId: number;
  projectId: number;
  members: ProjectMember[];
  onClose: () => void;
}

const ROLE_OPTIONS = ASSIGNABLE_PROJECT_MEMBER_ROLES.map((role) => ({
  label: PROJECT_MEMBER_ROLE_LABEL[role],
  value: role,
}));

/** 팀 멤버 중 아직 프로젝트에 없는 사람을 골라 추가한다. */
export function AddProjectMemberModal({
  open,
  teamId,
  projectId,
  members,
  onClose,
}: AddProjectMemberModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="프로젝트 멤버 추가"
      className="w-[480px]"
    >
      {open ? (
        <AddProjectMemberForm
          teamId={teamId}
          projectId={projectId}
          members={members}
        />
      ) : undefined}
    </Modal>
  );
}

function AddProjectMemberForm({
  teamId,
  projectId,
  members,
}: Omit<AddProjectMemberModalProps, 'open' | 'onClose'>) {
  const [role, setRole] = useState<AssignableProjectMemberRole>('EDITOR');
  const { data: teamMembers, isPending } = useQuery(
    teamQueries.members(teamId),
  );
  const addMember = useAddProjectMember(projectId);

  const joined = new Set(members.map((member) => member.userId));
  const candidates =
    teamMembers?.filter((member) => !joined.has(member.userId)) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="typography-label-x-small text-on-surface-variant">
          부여할 역할
        </span>
        <SegmentedControl
          options={ROLE_OPTIONS}
          value={role}
          onChange={setRole}
        />
      </div>

      {addMember.isError && (
        <p className="typography-subtext-medium text-error">
          추가하지 못했어요. 프로젝트 소유자만 멤버를 추가할 수 있어요.
        </p>
      )}

      <div className="h-72 overflow-y-auto">
        {isPending ? (
          <p className="typography-subtext-medium text-on-surface-variant">
            팀 멤버를 불러오는 중…
          </p>
        ) : candidates.length === 0 ? (
          <p className="typography-subtext-medium text-on-surface-variant">
            추가할 수 있는 팀 멤버가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {candidates.map((member) => (
              <li key={member.userId}>
                <CandidateRow
                  userId={member.userId}
                  disabled={addMember.isPending}
                  onAdd={() =>
                    addMember.mutate({ userId: member.userId, role })
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CandidateRow({
  userId,
  disabled,
  onAdd,
}: {
  userId: number;
  disabled: boolean;
  onAdd: () => void;
}) {
  const { data: user } = useQuery(userQueries.detail(userId));

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-container">
      <UserAvatar user={user} size={32} />
      <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
        {user ? (user.nickname ?? user.name) : ''}
      </span>
      <Button size="S" variant="weak" disabled={disabled} onClick={onAdd}>
        추가
      </Button>
    </div>
  );
}
