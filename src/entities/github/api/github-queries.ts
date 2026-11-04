import { type QueryKey } from '@tanstack/react-query';

// PR 관련 키는 [...all, projectId, repoId, 'pulls'] 아래에 모아 저장소 단위로 한 번에 무효화할 수 있게 둡니다.
export const githubQueries = {
  all: ['github'] as const,
  orgRepos: (projectId: number): QueryKey => [
    ...githubQueries.all,
    'orgRepos',
    projectId,
  ],
  projectRepos: (projectId: number): QueryKey => [
    ...githubQueries.all,
    'projectRepos',
    projectId,
  ],
  pullBoard: (projectId: number, repoId: number): QueryKey => [
    ...githubQueries.all,
    projectId,
    repoId,
    'pulls',
    'board',
  ],
  pull: (projectId: number, repoId: number, prNumber: number): QueryKey => [
    ...githubQueries.all,
    projectId,
    repoId,
    'pulls',
    prNumber,
  ],
  pullFiles: (
    projectId: number,
    repoId: number,
    prNumber: number,
  ): QueryKey => [
    ...githubQueries.all,
    projectId,
    repoId,
    'pulls',
    prNumber,
    'files',
  ],
};
