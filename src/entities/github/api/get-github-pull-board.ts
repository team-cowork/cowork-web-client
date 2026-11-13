import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type GithubPullBoard } from '@/entities/github/model/github';

export async function getGithubPullBoard(
  projectId: number,
  repoId: number,
): Promise<GithubPullBoard> {
  const { data } = await instance.get<ApiResponse<GithubPullBoard>>(
    `/project/projects/${projectId}/github-repos/${repoId}/pulls`,
  );
  return data.data;
}
