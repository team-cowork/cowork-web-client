import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type GithubPullFile } from '../model/github';

export async function getGithubPullFiles(
  projectId: number,
  repoId: number,
  prNumber: number,
): Promise<GithubPullFile[]> {
  const { data } = await instance.get<ApiResponse<GithubPullFile[]>>(
    `/project/projects/${projectId}/github-repos/${repoId}/pulls/${prNumber}/files`,
  );
  return data.data;
}
