import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ProjectGithubRepo } from '../model/github';

export async function getProjectGithubRepos(
  projectId: number,
): Promise<ProjectGithubRepo[]> {
  const { data } = await instance.get<ApiResponse<ProjectGithubRepo[]>>(
    `/project/projects/${projectId}/github-repos`,
  );
  return data.data;
}
