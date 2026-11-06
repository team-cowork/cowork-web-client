'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { githubQueries } from '@/entities/github/api/github-queries';
import { type GithubPullSummary } from '@/entities/github/model/github';
import { formatDate } from '@/shared/lib/format-date';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { GithubPrDetailModal } from '@/widgets/project-detail/ui/github-pr-detail-modal';

interface GithubPrBoardProps {
  projectId: number;
  canWrite: boolean;
}

function GithubPrReposError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="저장소를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
    />
  );
}

function PullBoardError({ error, resetErrorBoundary }: FallbackProps) {
  const upstreamError = isAxiosError(error) && error.response?.status === 502;

  return (
    <ErrorState
      title="PR 보드를 불러오지 못했어요"
      description={
        upstreamError
          ? 'GitHub 응답에 문제가 있어요. 잠시 후 다시 시도해 주세요.'
          : '잠시 후 다시 시도해 주세요.'
      }
      action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
    />
  );
}

export function GithubPrBoard({ projectId, canWrite }: GithubPrBoardProps) {
  return (
    <QueryBoundary
      loadingFallback={<LoadingPane label="저장소를 불러오는 중…" />}
      errorFallback={GithubPrReposError}
      resetKeys={[projectId]}
    >
      <GithubPrBoardContent projectId={projectId} canWrite={canWrite} />
    </QueryBoundary>
  );
}

function GithubPrBoardContent({ projectId, canWrite }: GithubPrBoardProps) {
  const [selectedRepoId, setSelectedRepoId] = useState<string>();
  const { data: repos } = useSuspenseQuery(
    githubQueries.projectRepos(projectId),
  );

  if (repos.length === 0) {
    return (
      <EmptyState
        title="연결된 GitHub 저장소가 없어요"
        description="위의 ‘GitHub 저장소’ 섹션에서 저장소를 연결하면 PR을 확인할 수 있어요."
      />
    );
  }

  const selectedRepo =
    repos.find((repo) => String(repo.id) === selectedRepoId) ?? repos[0];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {repos.length > 1 && (
        <div className="overflow-x-auto" aria-label="PR 저장소 선택">
          <SegmentedControl
            value={String(selectedRepo.id)}
            onChange={setSelectedRepoId}
            options={repos.map((repo) => ({
              value: String(repo.id),
              label: repo.githubRepoUrl
                .replace(/^https?:\/\/github\.com\//, '')
                .replace(/\/$/, '')
                .replace(/\.git$/, ''),
            }))}
          />
        </div>
      )}
      <QueryBoundary
        loadingFallback={<LoadingPane label="PR을 불러오는 중…" />}
        errorFallback={PullBoardError}
        resetKeys={[projectId, selectedRepo.id]}
      >
        <PullBoard
          key={`${projectId}-${selectedRepo.id}`}
          projectId={projectId}
          repoId={selectedRepo.id}
          canWrite={canWrite}
        />
      </QueryBoundary>
    </div>
  );
}

function PullBoard({
  projectId,
  repoId,
  canWrite,
}: GithubPrBoardProps & { repoId: number }) {
  const [selectedPull, setSelectedPull] = useState<GithubPullSummary | null>(
    null,
  );
  const { data: board } = useSuspenseQuery(
    githubQueries.pullBoard(projectId, repoId),
  );

  // 서버가 분류한 그룹과 순서를 그대로 보여준다.
  const columns = [
    { title: 'Draft', pulls: board.draft },
    { title: '리뷰 중', pulls: board.inReview },
  ];

  return (
    <>
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
        {columns.map(({ title, pulls }) => (
          <section
            key={title}
            className="flex min-w-0 flex-col gap-3 rounded-xl bg-surface-container p-3"
          >
            <h3 className="flex items-center gap-2 typography-label-medium text-on-surface">
              {title}
              <Badge>{pulls.length}</Badge>
            </h3>
            {pulls.length === 0 ? (
              <p className="py-6 typography-subtext-medium text-on-surface-variant">
                아직 이 상태의 PR이 없어요.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pulls.map((pull) => (
                  <li key={pull.number}>
                    <Button
                      variant="weak"
                      color="neutral"
                      onClick={() => setSelectedPull(pull)}
                      className="h-auto w-full flex-col items-start gap-2 rounded-lg border border-outline-variant bg-surface p-3 text-left whitespace-normal text-on-surface hover:bg-surface-variant"
                    >
                      <span className="flex w-full flex-wrap gap-1">
                        {pull.labels.map((label) => (
                          <Badge
                            key={label}
                            className="max-w-full break-all whitespace-normal"
                          >
                            {label}
                          </Badge>
                        ))}
                      </span>
                      <span className="typography-label-medium break-words">
                        {pull.title}
                      </span>
                      <span className="typography-subtext-medium break-all text-on-surface-variant">
                        #{pull.number} · {pull.author}
                      </span>
                      <time
                        dateTime={pull.updatedAt}
                        className="typography-subtext-medium text-on-surface-variant"
                      >
                        {formatDate(pull.updatedAt)} 업데이트
                      </time>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      {selectedPull && (
        <GithubPrDetailModal
          projectId={projectId}
          repoId={repoId}
          prNumber={selectedPull.number}
          draft={selectedPull.draft}
          canWrite={canWrite}
          onClose={() => setSelectedPull(null)}
        />
      )}
    </>
  );
}
