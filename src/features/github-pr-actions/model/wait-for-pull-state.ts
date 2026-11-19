import { type QueryClient } from '@tanstack/react-query';

import { githubQueries } from '@/entities/github/api/github-queries';
import { type GithubPull } from '@/entities/github/model/github';

// 머지 상태는 웹훅으로 반영되어 몇 초 늦을 수 있어 간격을 두고 몇 번 더 조회한다.
const RETRY_DELAYS_MS = [0, 1000, 2000, 3000];

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * 요청이 받아들여진 뒤 PR 상세를 다시 조회해 `isDone`을 만족하는지 확인한다.
 * 서버가 요청을 받기만 하고 처리하지 않을 수 있어, 응답 코드만으로 성공을 안내하지 않는다.
 * 조회가 실패하거나 끝까지 바뀌지 않으면 false를 돌려준다.
 */
export async function waitForPullState(
  queryClient: QueryClient,
  projectId: number,
  repoId: number,
  prNumber: number,
  isDone: (pull: GithubPull) => boolean,
): Promise<boolean> {
  const query = githubQueries.pull(projectId, repoId, prNumber);

  for (const delay of RETRY_DELAYS_MS) {
    await wait(delay);
    try {
      const pull = await queryClient.fetchQuery({ ...query, staleTime: 0 });
      if (isDone(pull)) return true;
    } catch {
      // 다시 조회하지 못한 것은 처리 실패가 아니라 확인 실패라서 다음 시도로 넘어간다.
    }
  }
  return false;
}
