import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type GithubIssueSummary } from '@/entities/github/model/github';

/** 연결된 저장소의 열린 이슈. 닫힌 이슈는 서버가 주지 않는다. */
export async function getGithubIssues(
  projectId: number,
  repoId: number,
): Promise<GithubIssueSummary[]> {
  const { data } = await instance.get<ApiResponse<GithubIssueSummary[]>>(
    `/project/projects/${projectId}/github-repos/${repoId}/issues`,
  );
  return data.data;
}
