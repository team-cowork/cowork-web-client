import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type GithubPull } from '@/entities/github/model/github';

export async function getGithubPull(
  projectId: number,
  repoId: number,
  prNumber: number,
): Promise<GithubPull> {
  const { data } = await instance.get<ApiResponse<GithubPull>>(
    `/project/projects/${projectId}/github-repos/${repoId}/pulls/${prNumber}`,
  );
  return data.data;
}
