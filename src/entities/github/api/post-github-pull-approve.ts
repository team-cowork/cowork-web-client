import { instance } from '@/shared/api/instance';

export async function postGithubPullApprove(
  projectId: number,
  repoId: number,
  prNumber: number,
): Promise<void> {
  await instance.post(
    `/project/projects/${projectId}/github-repos/${repoId}/pulls/${prNumber}/approve`,
  );
}
