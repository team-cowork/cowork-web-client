import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type AddProjectGithubRepoRequest,
  type ProjectGithubRepo,
} from '@/entities/github/model/github';

export async function postProjectGithubRepo(
  projectId: number,
  request: AddProjectGithubRepoRequest,
): Promise<ProjectGithubRepo> {
  const { data } = await instance.post<ApiResponse<ProjectGithubRepo>>(
    `/project/projects/${projectId}/github-repos`,
    request,
  );
  return data.data;
}
