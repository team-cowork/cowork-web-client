'use client';

import { useQuery } from '@tanstack/react-query';

import { githubQueries } from '@/entities/github/api/github-queries';
import { projectQueries } from '@/entities/project/api/project-queries';
import { GithubRepoConnect } from '@/features/github-repo-connect/ui/github-repo-connect';
import { GithubRepoDisconnect } from '@/features/github-repo-disconnect/ui/github-repo-disconnect';
import { GithubWebhookChannel } from '@/features/github-webhook-channel/ui/github-webhook-channel';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

export interface ProjectGithubReposProps {
  teamId: number;
  projectId: number;
  canWrite: boolean;
}

export function ProjectGithubRepos({
  teamId,
  projectId,
  canWrite,
}: ProjectGithubReposProps) {
  const repos = useQuery(githubQueries.projectRepos(projectId));
  const channels = useQuery(projectQueries.channels(projectId));

  return (
    <div className="flex flex-col gap-3">
      {canWrite && (
        <div className="flex justify-end">
          <GithubRepoConnect teamId={teamId} projectId={projectId} />
        </div>
      )}
      {repos.isPending ? (
        <p className="typography-subtext-medium text-on-surface-variant">
          저장소를 불러오는 중이에요…
        </p>
      ) : repos.isError ? (
        <EmptyState
          title="저장소를 불러오지 못했어요"
          action={
            <Button onClick={() => void repos.refetch()}>다시 시도</Button>
          }
        />
      ) : repos.data.length === 0 ? (
        <EmptyState
          title="연결된 GitHub 저장소가 없어요"
          description={
            canWrite
              ? '저장소를 연결하면 프로젝트에서 GitHub 알림을 받을 수 있어요.'
              : '저장소가 연결되면 이곳에서 확인할 수 있어요.'
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {repos.data.map((repo) => {
            const channel = channels.data?.find(
              (candidate) => candidate.id === repo.githubWebhookChannelId,
            );
            // 저장소 응답에는 이름이 없어 GitHub URL의 owner/name을 표시해요.
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
                            ? '알림 채널을 불러오는 중이에요…'
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
      )}
    </div>
  );
}
