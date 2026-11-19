import { instance } from '@/shared/api/instance';

export async function postGithubPullClose(
  projectId: number,
  repoId: number,
  prNumber: number,
): Promise<void> {
  await instance.post(
    `/project/projects/${projectId}/github-repos/${repoId}/pulls/${prNumber}/close`,
  );
}
