'use client';

import { type ReactNode, useState } from 'react';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { ChannelIcon } from '@/entities/channel/ui/channel-icon';
import { ChannelListItem } from '@/entities/channel/ui/channel-list-item';
import { projectQueries } from '@/entities/project/api/project-queries';
import {
  ASSIGNABLE_PROJECT_MEMBER_ROLES,
  PROJECT_MEMBER_ROLE_LABEL,
  PROJECT_STATUS_LABEL,
  type ProjectMember,
} from '@/entities/project/model/project';
import { userQueries } from '@/entities/user/api/user-queries';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { AddProjectMemberModal } from '@/features/project-members/ui/add-project-member-modal';
import { useRemoveProjectMember } from '@/features/project-members/model/use-remove-project-member';
import { useUpdateProjectMemberRole } from '@/features/project-members/model/use-update-project-member-role';
import { useMoveProject } from '@/features/project-reorder/model/use-move-project';
import { ProjectSettingsMenu } from '@/features/project-settings/ui/project-settings-menu';
import { formatDate } from '@/shared/lib/format-date';
import { channelPath } from '@/shared/model/paths';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { FolderIcon } from '@/shared/ui/icons/folder-icon';
import { MenuItem } from '@/shared/ui/menu-item';
import { SegmentedControl } from '@/shared/ui/segmented-control';

export interface ProjectDetailProps {
  teamId: number;
  projectId: number;
}

const ROLE_OPTIONS = ASSIGNABLE_PROJECT_MEMBER_ROLES.map((role) => ({
  label: PROJECT_MEMBER_ROLE_LABEL[role],
  value: role,
}));

/** 프로젝트 정보, 채널, 멤버를 보여주고 소유자에게는 관리 조작을 연다. */
export function ProjectDetail({ teamId, projectId }: ProjectDetailProps) {
  const { data: project } = useSuspenseQuery(projectQueries.detail(projectId));
  const { data: members = [] } = useQuery(projectQueries.members(projectId));
  const { data: me } = useQuery(userQueries.me());
  const moveProject = useMoveProject(teamId);
  const [addOpen, setAddOpen] = useState(false);

  const isOwner = members.some(
    (member) => member.userId === me?.id && member.role === 'OWNER',
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-8 py-10">
        <header className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container">
            <FolderIcon size={24} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate typography-title-medium text-on-surface">
                {project.name}
              </h1>
              <Badge color={project.status === 'ACTIVE' ? 'green' : 'neutral'}>
                {PROJECT_STATUS_LABEL[project.status]}
              </Badge>
            </div>
            <p className="typography-subtext-medium text-on-surface-variant">
              멤버 {project.memberCount}명 · {formatDate(project.createdAt)}{' '}
              생성
            </p>
            {project.description && (
              <p className="mt-1 typography-subtext-large text-on-surface">
                {project.description}
              </p>
            )}
          </div>
          {isOwner && (
            <ProjectSettingsMenu
              project={project}
              extraItems={
                <>
                  <MenuItem
                    disabled={
                      moveProject.isPending ||
                      !moveProject.canMove(project.id, 'up')
                    }
                    onClick={() => moveProject.move(project.id, 'up')}
                  >
                    목록에서 위로 이동
                  </MenuItem>
                  <MenuItem
                    disabled={
                      moveProject.isPending ||
                      !moveProject.canMove(project.id, 'down')
                    }
                    onClick={() => moveProject.move(project.id, 'down')}
                  >
                    목록에서 아래로 이동
                  </MenuItem>
                </>
              }
            />
          )}
        </header>

        <Section title="채널">
          <ProjectChannels teamId={teamId} projectId={projectId} />
        </Section>

        <Section
          title="멤버"
          action={
            isOwner && (
              <Button size="S" variant="weak" onClick={() => setAddOpen(true)}>
                멤버 추가
              </Button>
            )
          }
        >
          <ul className="flex flex-col gap-1">
            {members.map((member) => (
              <li key={member.id}>
                <MemberRow
                  projectId={projectId}
                  member={member}
                  manageable={isOwner && member.role !== 'OWNER'}
                />
              </li>
            ))}
          </ul>
        </Section>

        {/* PR 보드는 다른 파트에서 붙인다. 자리만 잡아 둔다. */}
        <Section title="PR 보드">
          <EmptyState
            icon={<FolderIcon />}
            title="PR 보드는 준비 중이에요"
            description="연결된 GitHub 저장소의 진행 중인 PR이 이곳에 표시됩니다"
          />
        </Section>
      </div>

      <AddProjectMemberModal
        open={addOpen}
        teamId={teamId}
        projectId={projectId}
        members={members}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="typography-label-medium text-on-surface">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProjectChannels({
  teamId,
  projectId,
}: {
  teamId: number;
  projectId: number;
}) {
  const {
    data: channels,
    isPending,
    isError,
  } = useQuery(projectQueries.channels(projectId));

  if (isPending) {
    return (
      <p className="typography-subtext-medium text-on-surface-variant">
        채널을 불러오는 중…
      </p>
    );
  }
  if (isError) {
    return (
      <p className="typography-subtext-medium text-error">
        채널을 불러오지 못했어요.
      </p>
    );
  }
  if (channels.length === 0) {
    return (
      <p className="typography-subtext-medium text-on-surface-variant">
        아직 이 프로젝트에 속한 채널이 없어요.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {channels.map((channel) => (
        <li key={channel.id}>
          <ChannelListItem
            name={channel.name}
            href={channelPath(teamId, channel.id)}
            prefix={<ChannelIcon viewType={channel.viewType} size={18} />}
          />
        </li>
      ))}
    </ul>
  );
}

function MemberRow({
  projectId,
  member,
  manageable,
}: {
  projectId: number;
  member: ProjectMember;
  manageable: boolean;
}) {
  const { data: user } = useQuery(userQueries.detail(member.userId));
  const updateRole = useUpdateProjectMemberRole(projectId);
  const removeMember = useRemoveProjectMember(projectId);
  const pending = updateRole.isPending || removeMember.isPending;

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-container">
      <UserAvatar user={user} size={32} />
      <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
        {user ? (user.nickname ?? user.name) : ''}
      </span>
      {manageable && member.role !== 'OWNER' ? (
        <>
          <SegmentedControl
            options={ROLE_OPTIONS}
            value={member.role}
            onChange={(role) =>
              !pending && updateRole.mutate({ memberId: member.id, role })
            }
          />
          <Button
            size="S"
            variant="weak"
            color="danger"
            disabled={pending}
            onClick={() => removeMember.mutate(member.id)}
          >
            제거
          </Button>
        </>
      ) : (
        <Badge color={member.role === 'OWNER' ? 'brand' : 'neutral'}>
          {PROJECT_MEMBER_ROLE_LABEL[member.role]}
        </Badge>
      )}
    </div>
  );
}
