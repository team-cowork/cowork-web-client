'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { githubQueries } from '@/entities/github/api/github-queries';
import { projectQueries } from '@/entities/project/api/project-queries';
import { GithubRepoConnect } from '@/features/github-repo-connect/ui/github-repo-connect';
import { GithubRepoDisconnect } from '@/features/github-repo-disconnect/ui/github-repo-disconnect';
import { GithubWebhookChannel } from '@/features/github-webhook-channel/ui/github-webhook-channel';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface ProjectGithubReposProps {
  teamId: number;
  projectId: number;
  canWrite: boolean;
}

function ProjectGithubReposError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="저장소를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
    />
  );
}

export function ProjectGithubRepos({
  teamId,
  projectId,
  canWrite,
}: ProjectGithubReposProps) {
  return (
    <div className="flex flex-col gap-3">
      {canWrite && (
        <div className="flex justify-end">
          <GithubRepoConnect teamId={teamId} projectId={projectId} />
        </div>
      )}
      <QueryBoundary
        loadingFallback={<LoadingPane label="저장소를 불러오는 중…" />}
        errorFallback={ProjectGithubReposError}
        resetKeys={[projectId]}
      >
        <ProjectGithubReposContent projectId={projectId} canWrite={canWrite} />
      </QueryBoundary>
    </div>
  );
}

function ProjectGithubReposContent({
  projectId,
  canWrite,
}: Omit<ProjectGithubReposProps, 'teamId'>) {
  const { data: repos } = useSuspenseQuery(
    githubQueries.projectRepos(projectId),
  );
  // 채널 이름은 보조 정보라 저장소 목록을 막지 않도록 일반 쿼리로 읽는다.
  const channels = useQuery(projectQueries.channels(projectId));

  if (repos.length === 0)
    return (
      <EmptyState
        title="연결된 GitHub 저장소가 없어요"
        description={
          canWrite
            ? '저장소를 연결하면 프로젝트에서 GitHub 알림을 받을 수 있어요.'
            : '저장소가 연결되면 이곳에서 확인할 수 있어요.'
        }
      />
    );

  return (
    <ul className="flex flex-col gap-3">
      {repos.map((repo) => {
        const channel = channels.data?.find(
          (candidate) => candidate.id === repo.githubWebhookChannelId,
        );
        // 저장소 응답에는 이름이 없어 GitHub URL의 owner/name을 표시한다.
        const name = repo.githubRepoUrl
          .replace(/^https?:\/\/github\.com\//, '')
          .replace(/\/$/, '')
          .replace(/\.git$/, '');
        const githubUrl =
          /^https:\/\/github\.com\/[^/]+\/[^/]+\/?(?:\.git)?$/.test(
            repo.githubRepoUrl,
          )
            ? repo.githubRepoUrl
            : undefined;

        return (
          <li
            key={repo.id}
            className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-4"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="typography-label-medium break-all text-primary hover:underline"
              >
                {name}
              </a>
              <p className="typography-subtext-medium text-on-surface-variant">
                {repo.githubWebhookChannelId == null
                  ? '알림이 꺼져 있어요.'
                  : channel
                    ? `알림 채널: #${channel.name}`
                    : channels.isError
                      ? '알림 채널 이름을 불러오지 못했어요.'
                      : channels.isPending
                        ? '알림 채널을 불러오는 중…'
                        : '알림 채널을 확인할 수 없어요.'}
              </p>
            </div>
            {canWrite && (
              <div className="flex flex-wrap gap-2">
                <GithubWebhookChannel projectId={projectId} repo={repo} />
                <GithubRepoDisconnect projectId={projectId} repo={repo} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
