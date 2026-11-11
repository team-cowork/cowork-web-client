'use client';

import { type ReactNode } from 'react';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

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
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { FolderIcon } from '@/shared/ui/icons/folder-icon';
import { MenuItem } from '@/shared/ui/menu-item';
import { GithubPrBoard } from '@/widgets/project-detail/ui/github-pr-board';
import { ProjectGithubRepos } from '@/widgets/project-detail/ui/project-github-repos';

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
  // 권한은 기존 비중단 쿼리의 캐시와 기본값을 유지하고 멤버 목록만 별도로 중단한다.
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
          <QueryBoundary
            loadingFallback={<LoadingPane label="채널을 불러오는 중…" />}
            errorFallback={ProjectChannelsError}
            resetKeys={[projectId]}
          >
            <ProjectChannels teamId={teamId} projectId={projectId} />
          </QueryBoundary>
        </Section>

        <Section title="멤버">
          <QueryBoundary
            loadingFallback={<LoadingPane label="멤버를 불러오는 중…" />}
            errorFallback={ProjectMembersError}
            resetKeys={[projectId]}
          >
            <ProjectMembers projectId={projectId} />
          </QueryBoundary>
        </Section>

        <Section title="GitHub 저장소">
          <ProjectGithubRepos
            teamId={teamId}
            projectId={projectId}
            canWrite={canWrite}
          />
        </Section>

        <Section title="PR 보드">
          <GithubPrBoard projectId={projectId} canWrite={canWrite} />
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
  const { data: channels } = useSuspenseQuery(
    projectQueries.channels(projectId),
  );

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

function ProjectMembers({ projectId }: Pick<ProjectDetailProps, 'projectId'>) {
  const { data: members } = useSuspenseQuery(projectQueries.members(projectId));
  return (
    <ul className="flex flex-col gap-1">
      {members.map((member) => (
        <li key={member.userId}>
          <MemberRow member={member} />
        </li>
      ))}
    </ul>
  );
}

function ProjectChannelsError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="채널을 불러오지 못했어요."
      action={
        <Button size="S" variant="weak" onClick={resetErrorBoundary}>
          다시 시도
        </Button>
      }
    />
  );
}

function ProjectMembersError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="멤버를 불러오지 못했어요"
      action={
        <Button size="S" variant="weak" onClick={resetErrorBoundary}>
          다시 시도
        </Button>
      }
    />
  );
}
