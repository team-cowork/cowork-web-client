import { isHttpStatus } from '@/shared/api/http-error';
import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type GithubRepoSummary } from '@/entities/github/model/github';

// 팀에 GitHub 조직이 연동되지 않았으면 서버가 400으로 응답한다.
// 오류가 아니라 안내가 필요한 정상 상태라 예외 대신 null을 반환한다.
export async function getGithubOrgRepos(
  projectId: number,
): Promise<GithubRepoSummary[] | null> {
  try {
    const { data } = await instance.get<ApiResponse<GithubRepoSummary[]>>(
      `/project/projects/${projectId}/github/repos`,
    );
    return data.data;
  } catch (error) {
    if (isHttpStatus(error, 400)) return null;

    throw error;
  }
}
