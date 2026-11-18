'use client';

// TODO(임시): 발표용 PR 칸반. 이슈 칸반과 같은 모양으로 `Draft` / `리뷰 중` / `완료됨` 세 열에
// 연결된 저장소의 PR 을 보여 준다. 카드를 누르면 PR 상세(승인·머지)가 열린다. 서버가 머지·닫힌
// PR 을 주지 않아 `완료됨` 은 이 브라우저가 본 PR 이 목록에서 사라진 것이다(use-vanished-items).
// 칸반을 지울 때 이 폴더도 지운다.
import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { githubQueries } from '@/entities/github/api/github-queries';
import { type GithubPullSummary } from '@/entities/github/model/github';
import { GithubPrDetailModal } from '@/widgets/project-detail/ui/github-pr-detail-modal';
import { formatDate } from '@/shared/lib/format-date';
import { useVanishedItems } from '@/shared/lib/use-vanished-items';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { KanbanCard } from '@/shared/ui/kanban-card';
import { KanbanColumn } from '@/shared/ui/kanban-column';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SegmentedControl } from '@/shared/ui/segmented-control';

interface PullBoardProps {
  projectId: number;
  canWrite: boolean;
}

function BoardError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="PR 을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
    />
  );
}

const repoName = (url: string) =>
  url
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\/$/, '')
    .replace(/\.git$/, '');

export function PullBoard({ projectId, canWrite }: PullBoardProps) {
  return (
    <QueryBoundary
      loadingFallback={<LoadingPane label="저장소를 불러오는 중…" />}
      errorFallback={BoardError}
      resetKeys={[projectId]}
    >
      <RepoPulls projectId={projectId} canWrite={canWrite} />
    </QueryBoundary>
  );
}

function RepoPulls({ projectId, canWrite }: PullBoardProps) {
  const { data: repos } = useSuspenseQuery(
    githubQueries.projectRepos(projectId),
  );
  const [selectedId, setSelectedId] = useState<string>();

  if (repos.length === 0) {
    return (
      <EmptyState
        title="연결된 GitHub 저장소가 없어요"
        description="프로젝트 상세에서 저장소를 연결하면 PR 을 볼 수 있어요."
      />
    );
  }

  const repo =
    repos.find((candidate) => String(candidate.id) === selectedId) ?? repos[0];

  return (
    <>
      {repos.length > 1 && (
        <div className="overflow-x-auto" aria-label="저장소 선택">
          <SegmentedControl
            value={String(repo.id)}
            onChange={setSelectedId}
            options={repos.map((candidate) => ({
              value: String(candidate.id),
              label: repoName(candidate.githubRepoUrl),
            }))}
          />
        </div>
      )}
      <QueryBoundary
        loadingFallback={<LoadingPane label="PR 을 불러오는 중…" />}
        errorFallback={BoardError}
        resetKeys={[projectId, repo.id]}
      >
        <Board
          key={repo.id}
          projectId={projectId}
          repoId={repo.id}
          canWrite={canWrite}
        />
      </QueryBoundary>
    </>
  );
}

function Board({
  projectId,
  repoId,
  canWrite,
}: PullBoardProps & { repoId: number }) {
  const { data: board } = useSuspenseQuery(
    githubQueries.pullBoard(projectId, repoId),
  );
  const [selected, setSelected] = useState<GithubPullSummary | null>(null);
  const done = useVanishedItems(`cowork.pull-board.seen.${repoId}`, [
    ...board.draft,
    ...board.inReview,
  ]);

  const columns = [
    { title: 'Draft', pulls: board.draft, empty: '이 상태의 PR 이 없어요.' },
    {
      title: '리뷰 중',
      pulls: board.inReview,
      empty: '이 상태의 PR 이 없어요.',
    },
    {
      title: '완료됨',
      pulls: done,
      empty: '이 화면에서 본 PR 이 머지되거나 닫히면 여기로 와요.',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
        {columns.map(({ title, pulls, empty }) => (
          <KanbanColumn
            key={title}
            title={title}
            count={pulls.length}
            emptyText={empty}
          >
            <ul className="flex flex-col gap-2">
              {pulls.map((pull) => (
                <li key={pull.number}>
                  <PullCard
                    pull={pull}
                    // 끝난 PR 은 상세가 열리지 않을 수 있어 GitHub 로 보낸다.
                    onOpen={
                      title === '완료됨' ? undefined : () => setSelected(pull)
                    }
                  />
                </li>
              ))}
            </ul>
          </KanbanColumn>
        ))}
      </div>
      {selected && (
        <GithubPrDetailModal
          projectId={projectId}
          repoId={repoId}
          prNumber={selected.number}
          draft={selected.draft}
          htmlUrl={selected.htmlUrl}
          canWrite={canWrite}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function PullCard({
  pull,
  onOpen,
}: {
  pull: GithubPullSummary;
  onOpen?: () => void;
}) {
  const href = /^https:\/\/github\.com\//.test(pull.htmlUrl)
    ? pull.htmlUrl
    : undefined;

  return (
    <KanbanCard onClick={onOpen} href={onOpen ? undefined : href}>
      {pull.labels.length > 0 && (
        <span className="flex flex-wrap gap-1">
          {pull.labels.map((label) => (
            <Badge key={label} className="max-w-full break-all">
              {label}
            </Badge>
          ))}
        </span>
      )}
      <span className="typography-label-small break-words text-on-surface">
        {pull.title}
      </span>
      <span className="typography-subtext-medium break-all text-on-surface-variant">
        #{pull.number} · {pull.author} · {formatDate(pull.updatedAt)}
      </span>
    </KanbanCard>
  );
}
