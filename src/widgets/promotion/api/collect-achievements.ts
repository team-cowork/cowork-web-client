import { type AchievementSummary } from '@/widgets/promotion/model/achievements';

// team-cowork 공개 저장소의 최근 6개월 개발 활동을 GitHub에서 모은다.
// 원본: cowork-promotion/scripts/lib/github-achievements.mjs, achievement-metrics.mjs (집계 기준도 같다)

const OWNER = 'team-cowork';
const AI_ACCOUNTS = new Set(['claude', 'copilot', 'devin-ai-integration']);
const RELEASE_BASES = new Set(['main', 'master']);
const RELEASE_HEADS = new Set(['develop', 'dev', 'development']);

const METADATA_QUERY = `query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    defaultBranchRef { name target { oid ... on Commit { history(first: 1) { totalCount } } } }
  }
}`;
const HISTORY_QUERY = `query($owner: String!, $name: String!, $oid: GitObjectID!, $start: GitTimestamp!, $end: GitTimestamp!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    object(oid: $oid) { ... on Commit {
      history(first: 100, after: $cursor, since: $start, until: $end) {
        pageInfo { hasNextPage endCursor }
        nodes { oid committedDate additions deletions parents { totalCount } author { email user { id login } } }
      }
    } }
  }
}`;
const PULL_REQUEST_QUERY = `query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: 100, after: $cursor, states: MERGED, orderBy: {field: CREATED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes { number mergedAt baseRefName headRefName }
    }
  }
}`;

interface Page<T> {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: T[];
}

interface Commit {
  oid: string;
  committedDate: string;
  additions: number;
  deletions: number;
  parents: { totalCount: number };
  author: {
    email: string | null;
    user: { id: string; login: string } | null;
  } | null;
}

interface PullRequest {
  number: number;
  mergedAt: string;
  baseRefName: string;
  headRefName: string;
}

const seoulDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const seoulDay = (date: Date) => seoulDate.format(date);

/** 오늘(서울 기준)로 끝나는 6개월. 시작은 포함, 끝은 제외한다. */
function sixMonthPeriod(now = new Date()) {
  const end = seoulDay(now);
  const date = new Date(`${end}T00:00:00Z`);
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 6, 1),
  );
  const lastDay = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  ).getUTCDate();
  start.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return {
    start: Date.parse(`${start.toISOString().slice(0, 10)}T00:00:00+09:00`),
    end: Date.parse(`${end}T00:00:00+09:00`),
  };
}

const isRelease = (pullRequest: PullRequest) =>
  RELEASE_BASES.has(pullRequest.baseRefName) &&
  RELEASE_HEADS.has(pullRequest.headRefName);

const isHuman = (user: { id: string; login: string } | null | undefined) =>
  !!user &&
  !user.id.startsWith('BOT_') &&
  !user.login.endsWith('[bot]') &&
  !AI_ACCOUNTS.has(user.login.toLowerCase());

/** 월요일 00:00(서울)부터 다음 월요일까지를 한 주로 본다. */
function weekStart(time: number) {
  const monday = new Date(`${seoulDay(new Date(time))}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

const MAX_RETRY_DELAY_MS = 60_000;

function retryDelay(response: Response): number | null {
  if (response.status >= 500) return 0;
  if (response.status !== 403 && response.status !== 429) return null;
  const retryAfter = Number(response.headers.get('retry-after'));
  if (retryAfter > 0) return retryAfter * 1000;
  if (response.headers.get('x-ratelimit-remaining') === '0') {
    const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
    return Number.isFinite(reset) ? Math.max(0, reset - Date.now()) : null;
  }
  return response.status === 429 ? MAX_RETRY_DELAY_MS : null;
}

export async function collectAchievements(
  token: string,
  signal: AbortSignal,
): Promise<AchievementSummary> {
  async function request<T>(
    path: string,
    body?: object,
    attempt = 0,
  ): Promise<T> {
    const response = await fetch(`https://api.github.com/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'cowork-web-client',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    if (!response.ok) {
      // 서버 오류와 호출 제한(403/429)은 잠깐 기다렸다가 두 번까지 다시 시도한다.
      const delay = retryDelay(response);
      if (delay !== null && delay <= MAX_RETRY_DELAY_MS && attempt < 2) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay || 1000 * 2 ** attempt),
        );
        return request(path, body, attempt + 1);
      }
      throw new Error(`GitHub request failed: ${response.status}`);
    }
    const data = await response.json();
    if (data.errors?.length) {
      throw new Error('GitHub returned an incomplete result.');
    }
    return data;
  }

  async function repository<T>(query: string, variables: object): Promise<T> {
    const result = await request<{ data: { repository: T } }>('graphql', {
      query,
      variables,
    });
    return result.data.repository;
  }

  async function pages<R, T>(
    query: string,
    variables: object,
    connection: (result: R) => Page<T>,
  ) {
    const nodes: T[] = [];
    let cursor: string | undefined;
    do {
      const page = connection(
        await repository<R>(query, { ...variables, cursor }),
      );
      nodes.push(...page.nodes);
      cursor = page.pageInfo.hasNextPage
        ? (page.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (cursor);
    return nodes;
  }

  const repositories: { name: string }[] = [];
  for (let page = 1; ; page++) {
    const batch = await request<
      { name: string; fork: boolean; private: boolean }[]
    >(`orgs/${OWNER}/repos?type=public&per_page=100&page=${page}`);
    repositories.push(
      ...batch.filter((candidate) => !candidate.fork && !candidate.private),
    );
    if (batch.length < 100) break;
  }
  if (repositories.length === 0) {
    throw new Error('GitHub returned no public repositories.');
  }

  const period = sixMonthPeriod();
  const now = Date.now();
  const inPeriod = (value: string) => {
    const time = Date.parse(value);
    return time >= period.start && time < period.end;
  };

  async function collectRepository(name: string) {
    const variables = { owner: OWNER, name };
    const { defaultBranchRef: branch } = await repository<{
      defaultBranchRef: {
        target: { oid: string; history: { totalCount: number } };
      } | null;
    }>(METADATA_QUERY, variables);
    const [commits, pullRequests] = await Promise.all([
      branch
        ? pages<{ object: { history: Page<Commit> } }, Commit>(
            HISTORY_QUERY,
            {
              ...variables,
              oid: branch.target.oid,
              start: new Date(period.start).toISOString(),
              end: new Date(period.end - 1).toISOString(),
            },
            (result) => result.object.history,
          )
        : [],
      pages<{ pullRequests: Page<PullRequest> }, PullRequest>(
        PULL_REQUEST_QUERY,
        variables,
        (result) => result.pullRequests,
      ),
    ]);
    return {
      name,
      totalCommits: branch?.target.history.totalCount ?? 0,
      commits,
      pullRequests,
    };
  }

  const collected = [];
  for (const { name } of repositories) {
    collected.push(await collectRepository(name));
  }

  let additions = 0;
  let deletions = 0;
  let totalCommits = 0;
  const contributors = new Map<string, string>();
  const weeks = new Map<string, number>();
  const seenPullRequests = new Set<string>();

  for (const repo of collected) {
    totalCommits += repo.totalCommits;

    const seenCommits = new Set<string>();
    for (const commit of repo.commits) {
      if (!inPeriod(commit.committedDate) || seenCommits.has(commit.oid)) {
        continue;
      }
      seenCommits.add(commit.oid);
      // 병합 커밋은 같은 변경을 두 번 세게 되므로 뺀다.
      if (commit.parents.totalCount > 1) continue;
      additions += commit.additions;
      deletions += commit.deletions;
      const user = commit.author?.user;
      if (user && isHuman(user)) contributors.set(user.id, user.login);
    }

    // 가장 활발했던 주는 기간과 상관없이 지금까지의 모든 병합 PR로 고른다(릴리스 PR 제외).
    for (const pullRequest of repo.pullRequests) {
      const mergedAt = Date.parse(pullRequest.mergedAt);
      const id = `${repo.name.toLowerCase()}:${pullRequest.number}`;
      if (
        !Number.isFinite(mergedAt) ||
        mergedAt >= now ||
        seenPullRequests.has(id) ||
        isRelease(pullRequest)
      ) {
        continue;
      }
      seenPullRequests.add(id);
      const week = weekStart(mergedAt);
      weeks.set(week, (weeks.get(week) ?? 0) + 1);
    }
  }

  const peakPullRequests = Math.max(0, ...weeks.values());

  return {
    changedLines: additions + deletions,
    additions,
    deletions,
    commits: totalCommits,
    peakPullRequests,
    contributorLogins: [...contributors.values()].sort((a, b) =>
      a.localeCompare(b),
    ),
  };
}
