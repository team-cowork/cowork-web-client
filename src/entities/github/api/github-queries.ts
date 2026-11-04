import { queryOptions } from '@tanstack/react-query';

import { getGithubOrgRepos } from '@/entities/github/api/get-github-org-repos';
import { getGithubPull } from '@/entities/github/api/get-github-pull';
import { getGithubPullBoard } from '@/entities/github/api/get-github-pull-board';
import { getGithubPullFiles } from '@/entities/github/api/get-github-pull-files';
import { getProjectGithubRepos } from '@/entities/github/api/get-project-github-repos';

export const githubQueries = {
  all: () => ['github'] as const,
  orgRepos: (projectId: number) =>
    queryOptions({
      queryKey: [...githubQueries.all(), 'orgRepos', projectId],
      queryFn: () => getGithubOrgRepos(projectId),
    }),
  projectRepos: (projectId: number) =>
    queryOptions({
      queryKey: [...githubQueries.all(), 'projectRepos', projectId],
      queryFn: () => getProjectGithubRepos(projectId),
    }),
  // 한 저장소의 PR 보드·상세·변경 파일 키를 모두 포함하는 접두사예요. 무효화할 때 사용해요.
  pulls: (projectId: number, repoId: number) =>
    [...githubQueries.all(), projectId, repoId, 'pulls'] as const,
  pullBoard: (projectId: number, repoId: number) =>
    queryOptions({
      queryKey: [...githubQueries.pulls(projectId, repoId), 'board'],
      queryFn: () => getGithubPullBoard(projectId, repoId),
    }),
  pull: (projectId: number, repoId: number, prNumber: number) =>
    queryOptions({
      queryKey: [...githubQueries.pulls(projectId, repoId), prNumber],
      queryFn: () => getGithubPull(projectId, repoId, prNumber),
    }),
  pullFiles: (projectId: number, repoId: number, prNumber: number) =>
    queryOptions({
      queryKey: [...githubQueries.pulls(projectId, repoId), prNumber, 'files'],
      queryFn: () => getGithubPullFiles(projectId, repoId, prNumber),
    }),
} as const;
