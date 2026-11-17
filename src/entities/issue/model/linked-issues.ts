// TODO(임시): 발표용 칸반이 PR 이 연결된 이슈를 진행중으로 보이게 하려고, PR 이 가리키는
// 이슈 번호를 글에서 찾아낸다. 서버가 이슈와 PR 의 연결을 주면 이 파일을 지운다.
import { type GithubPull } from '@/entities/github/model/github';

const ISSUE_REFERENCE = /#(\d+)/g;

/**
 * PR 제목·본문·브랜치 이름에 적힌 `#번호` 들. `Closes #9`, `Refs #9`, `feat/#9-...`
 * 같은 것을 가리지 않고 모은다. 이슈와 PR 은 한 저장소에서 번호를 같이 쓰므로, PR 번호가
 * 섞여 있어도 이슈 번호와 겹치지 않는다.
 */
export function linkedIssueNumbers(
  pull: Pick<GithubPull, 'title' | 'body' | 'headRef'>,
): Set<number> {
  const text = [pull.title, pull.body ?? '', pull.headRef].join('\n');

  return new Set([...text.matchAll(ISSUE_REFERENCE)].map((m) => Number(m[1])));
}
