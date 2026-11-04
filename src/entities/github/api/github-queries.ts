import { type QueryKey } from '@tanstack/react-query';

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
  ],
  pull: (projectId: number, repoId: number, prNumber: number): QueryKey => [
    ...githubQueries.all,
    projectId,
    repoId,
    'pull',
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
    'pull',
    prNumber,
    'files',
  ],
};
