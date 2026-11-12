import { instance } from '@/shared/api/instance';

/** 이슈의 라벨을 `labels`로 통째로 바꾼다. 서버가 202로 접수만 확인한다. */
export async function patchGithubIssueLabels(
  projectId: number,
  repoId: number,
  issueNumber: number,
  labels: string[],
): Promise<void> {
  await instance.patch(
    `/project/projects/${projectId}/github-repos/${repoId}/issues/${issueNumber}/labels`,
    { labels },
  );
}
