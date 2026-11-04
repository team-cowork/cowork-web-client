import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type GithubInstallUrl } from '../model/github';

export async function getTeamGithubInstallUrl(
  teamId: number,
): Promise<GithubInstallUrl> {
  const { data } = await instance.get<ApiResponse<GithubInstallUrl>>(
    `/team/teams/${teamId}/github/install-url`,
  );
  return data.data;
}
