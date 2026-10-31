'use client';

import { type ReactNode } from 'react';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { ChannelIcon } from '@/entities/channel/ui/channel-icon';
import { ChannelListItem } from '@/entities/channel/ui/channel-list-item';
import { projectQueries } from '@/entities/project/api/project-queries';
import {
  PROJECT_STATUS_LABEL,
  type ProjectMember,
} from '@/entities/project/model/project';
import { userQueries } from '@/entities/user/api/user-queries';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { useMoveProject } from '@/features/project-reorder/model/use-move-project';
import { ProjectSettingsMenu } from '@/features/project-settings/ui/project-settings-menu';
import { formatDate } from '@/shared/lib/format-date';
import { channelPath } from '@/shared/model/paths';
import { Badge } from '@/shared/ui/badge';
import { EmptyState } from '@/shared/ui/empty-state';
import { FolderIcon } from '@/shared/ui/icons/folder-icon';
import { MenuItem } from '@/shared/ui/menu-item';

export interface ProjectDetailProps {
  teamId: number;
  projectId: number;
}

/**
 * 프로젝트 정보, 채널, 접근할 수 있는 멤버를 보여준다.
 * 멤버는 팀 역할로 정해져 여기서 관리하지 않고, 수정 권한이 있으면 설정 메뉴를 연다.
 */
export function ProjectDetail({ teamId, projectId }: ProjectDetailProps) {
  const { data: project } = useSuspenseQuery(projectQueries.detail(projectId));
  const { data: members = [] } = useQuery(projectQueries.members(projectId));
  const { data: me } = useQuery(userQueries.me());
  const moveProject = useMoveProject(teamId);
  // 세부 권한(수정·삭제)은 서버가 다시 확인한다.
  const canWrite = members.some(
    (member) => member.userId === me?.id && member.write,
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
          {canWrite && (
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

        <Section title="멤버">
          <ul className="flex flex-col gap-1">
            {members.map((member) => (
              <li key={member.userId}>
                <MemberRow member={member} />
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
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="typography-label-medium text-on-surface">{title}</h2>
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

function MemberRow({ member }: { member: ProjectMember }) {
  const { data: user } = useQuery(userQueries.detail(member.userId));

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-container">
      <UserAvatar user={user} size={32} />
      <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
        {user ? (user.nickname ?? user.name) : ''}
      </span>
      <Badge color={member.write ? 'brand' : 'neutral'}>
        {member.write ? '편집 가능' : '읽기 전용'}
      </Badge>
    </div>
  );
}
