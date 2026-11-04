import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type GithubPullBoard } from '../model/github';

export async function getGithubPullBoard(
  projectId: number,
  repoId: number,
): Promise<GithubPullBoard> {
  const { data } = await instance.get<ApiResponse<GithubPullBoard>>(
    `/project/projects/${projectId}/github-repos/${repoId}/pulls`,
  );
  return data.data;
}
