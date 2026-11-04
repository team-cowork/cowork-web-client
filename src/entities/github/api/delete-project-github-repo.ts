import { instance } from '@/shared/api/instance';

export async function deleteProjectGithubRepo(
  projectId: number,
  repoId: number,
): Promise<void> {
  await instance.delete(
    `/project/projects/${projectId}/github-repos/${repoId}`,
  );
}
