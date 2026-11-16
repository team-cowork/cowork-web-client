'use client';

// TODO(임시): 서버 이슈 API 가 열린 이슈만 주고 닫힌 이슈는 안 줘서(`state=open` 고정), 이
// 브라우저가 전에 열린 이슈로 본 것이 지금 목록에서 사라졌으면 닫힌 것으로 본다. 다른
// 브라우저·기기와는 공유되지 않고, 삭제·이전된 이슈도 닫힌 것처럼 보일 수 있다.
// 서버가 닫힌 이슈를 주면(`state` 쿼리 등) 이 파일을 지운다.
import { useEffect, useState } from 'react';

import { type GithubIssueSummary } from '@/entities/github/model/github';

/** 한 저장소에서 기억해 둘 이슈 수. */
const MAX_KNOWN = 200;

const keyOf = (repoId: number) => `cowork.issue-board.seen.${repoId}`;

function read(key: string): GithubIssueSummary[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? (parsed as GithubIssueSummary[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, issues: GithubIssueSummary[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(issues));
  } catch {
    // 저장소를 못 쓰면 닫힌 이슈를 기억하지 못할 뿐이다.
  }
}

/** 기억해 둔 [known] 에 지금 열린 [open] 을 합친다. 바뀐 게 없으면 [known] 그대로다. */
function mergeKnown(
  known: GithubIssueSummary[],
  open: GithubIssueSummary[],
): GithubIssueSummary[] {
  const byNumber = new Map(known.map((issue) => [issue.number, issue]));
  const changed = open.some(
    (issue) =>
      JSON.stringify(byNumber.get(issue.number)) !== JSON.stringify(issue),
  );
  if (!changed) return known;

  const openNumbers = new Set(open.map((issue) => issue.number));
  const closed = known.filter((issue) => !openNumbers.has(issue.number));

  return [...open, ...closed].slice(0, MAX_KNOWN);
}

/** [open] 에서 사라진, 전에 본 이슈. 닫힌 이슈로 본다. */
export function useClosedIssues(
  repoId: number,
  open: GithubIssueSummary[],
): GithubIssueSummary[] {
  const key = keyOf(repoId);
  const [known, setKnown] = useState<GithubIssueSummary[]>(() => read(key));
  const merged = mergeKnown(known, open);

  // 렌더 중에 상태를 맞춘다. 바뀐 게 없으면 같은 값이라 한 번으로 끝난다.
  if (merged !== known) setKnown(merged);

  useEffect(() => write(key, known), [key, known]);

  const openNumbers = new Set(open.map((issue) => issue.number));

  return merged.filter((issue) => !openNumbers.has(issue.number));
}
