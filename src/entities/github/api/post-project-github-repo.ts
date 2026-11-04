import { instance } from '@/shared/api/instance';
import {
  type AddProjectGithubRepoRequest,
  type ProjectGithubRepo,
} from '../model/github';

export async function postProjectGithubRepo(
  projectId: number,
  request: AddProjectGithubRepoRequest,
): Promise<ProjectGithubRepo> {
  const { data } = await instance.post<ProjectGithubRepo>(
    `/project/projects/${projectId}/github-repos`,
    request,
  );
  return data;
}
