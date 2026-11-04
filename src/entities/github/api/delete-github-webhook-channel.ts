import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ProjectGithubRepo } from '@/entities/github/model/github';

export async function deleteGithubWebhookChannel(
  projectId: number,
  repoId: number,
): Promise<ProjectGithubRepo> {
  const { data } = await instance.delete<ApiResponse<ProjectGithubRepo>>(
    `/project/projects/${projectId}/github-repos/${repoId}/webhook-channel`,
  );
  return data.data;
}
