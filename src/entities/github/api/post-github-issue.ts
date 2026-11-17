import { instance } from '@/shared/api/instance';

export interface CreateGithubIssueRequest {
  title: string;
  body?: string;
  label?: string;
}

/** 이슈를 만든다. 서버가 접수만 확인하고 GitHub 에는 비동기로 만든다. */
export async function postGithubIssue(
  projectId: number,
  repoId: number,
  request: CreateGithubIssueRequest,
): Promise<void> {
  await instance.post(
    `/project/projects/${projectId}/github-repos/${repoId}/issues`,
    request,
  );
}
