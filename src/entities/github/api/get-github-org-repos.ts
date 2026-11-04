import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type GithubRepoSummary } from '../model/github';

export async function getGithubOrgRepos(
  projectId: number,
): Promise<GithubRepoSummary[]> {
  const { data } = await instance.get<ApiResponse<GithubRepoSummary[]>>(
    `/project/projects/${projectId}/github/repos`,
  );
  return data.data;
}
