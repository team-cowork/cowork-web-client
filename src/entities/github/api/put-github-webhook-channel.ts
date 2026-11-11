import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  type ProjectGithubRepo,
  type SetGithubWebhookChannelRequest,
} from '@/entities/github/model/github';

export async function putGithubWebhookChannel(
  projectId: number,
  repoId: number,
  request: SetGithubWebhookChannelRequest,
): Promise<ProjectGithubRepo> {
  const { data } = await instance.put<ApiResponse<ProjectGithubRepo>>(
    `/project/projects/${projectId}/github-repos/${repoId}/webhook-channel`,
    request,
  );
  return data.data;
}
