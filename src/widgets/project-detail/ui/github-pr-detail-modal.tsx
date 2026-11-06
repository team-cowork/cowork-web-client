'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { githubQueries } from '@/entities/github/api/github-queries';
import { GithubPrActions } from '@/features/github-pr-actions/ui/github-pr-actions';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { Markdown } from '@/shared/ui/markdown';
import { Modal } from '@/shared/ui/modal';
import { QueryBoundary } from '@/shared/ui/query-boundary';

interface GithubPrDetailModalProps {
  projectId: number;
  repoId: number;
  prNumber: number;
  /** 상세 응답에는 Draft 여부가 없어 보드 카드 값을 받는다. */
  draft: boolean;
  canWrite: boolean;
  onClose: () => void;
}

type PullTarget = Pick<
  GithubPrDetailModalProps,
  'projectId' | 'repoId' | 'prNumber'
>;

function PullDetailError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="PR 상세를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
    />
  );
}

function PullFilesError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="변경된 파일을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
    />
  );
}

export function GithubPrDetailModal({
  projectId,
  repoId,
  prNumber,
  draft,
  canWrite,
  onClose,
}: GithubPrDetailModalProps) {
  // 푸터는 경계 밖에 있어 같은 캐시를 일반 쿼리로 읽고, 상세가 준비된 뒤에만 보여준다.
  const pull = useQuery(githubQueries.pull(projectId, repoId, prNumber));
  const resetKeys = [projectId, repoId, prNumber];

  return (
    <Modal
      open
      onClose={onClose}
      title={`PR #${prNumber}`}
      className="w-[720px]"
      footer={
        pull.data && !pull.isError && canWrite ? (
          <PullActionsFooter
            projectId={projectId}
            repoId={repoId}
            prNumber={prNumber}
            draft={draft}
            mergeable={pull.data.mergeable}
          />
        ) : undefined
      }
    >
      <QueryBoundary
        loadingFallback={<LoadingPane label="PR 상세를 불러오는 중…" />}
        errorFallback={PullDetailError}
        resetKeys={resetKeys}
      >
        <PullDetail projectId={projectId} repoId={repoId} prNumber={prNumber} />
      </QueryBoundary>
      <section className="flex min-w-0 flex-col gap-3">
        <h3 className="typography-label-medium text-on-surface">변경된 파일</h3>
        <QueryBoundary
          loadingFallback={<LoadingPane label="변경된 파일을 불러오는 중…" />}
          errorFallback={PullFilesError}
          resetKeys={resetKeys}
        >
          <PullFiles
            projectId={projectId}
            repoId={repoId}
            prNumber={prNumber}
          />
        </QueryBoundary>
      </section>
    </Modal>
  );
}

function PullActionsFooter({
  projectId,
  repoId,
  prNumber,
  draft,
  mergeable,
}: PullTarget & { draft: boolean; mergeable: boolean | null | undefined }) {
  // 머지 API는 결과를 알려주지 않아서, 실패가 확실한 요청은 미리 막는다.
  const mergeBlockedReason = draft
    ? 'Draft PR은 머지할 수 없어요.'
    : mergeable === false
      ? '충돌이 있어 머지할 수 없어요.'
      : undefined;

  return (
    <GithubPrActions
      projectId={projectId}
      repoId={repoId}
      prNumber={prNumber}
      mergeBlockedReason={mergeBlockedReason}
    />
  );
}

function PullDetail({ projectId, repoId, prNumber }: PullTarget) {
  const { data: pull } = useSuspenseQuery(
    githubQueries.pull(projectId, repoId, prNumber),
  );
  const safeGithubUrl = /^https:\/\/github\.com\//.test(pull.htmlUrl)
    ? pull.htmlUrl
    : undefined;

  return (
    <>
      <h3 className="typography-title-small break-words text-on-surface">
        {pull.title}
      </h3>
      <p className="typography-subtext-large break-all text-on-surface-variant">
        작성자 {pull.author}
      </p>
      <p className="typography-subtext-medium break-all text-on-surface-variant">
        {pull.headRef} → {pull.baseRef}
      </p>
      {safeGithubUrl && (
        <a
          href={safeGithubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="typography-label-medium text-primary hover:underline"
        >
          GitHub에서 확인하기 ↗
        </a>
      )}
      <section className="min-w-0 rounded-lg border border-outline-variant p-4">
        {pull.body ? (
          <Markdown
            variant="document"
            className="typography-subtext-large text-on-surface"
          >
            {pull.body}
          </Markdown>
        ) : (
          <p className="typography-subtext-medium text-on-surface-variant">
            작성된 설명이 없어요.
          </p>
        )}
      </section>
    </>
  );
}

function PullFiles({ projectId, repoId, prNumber }: PullTarget) {
  const { data: files } = useSuspenseQuery(
    githubQueries.pullFiles(projectId, repoId, prNumber),
  );

  if (files.length === 0)
    return (
      <p className="typography-subtext-medium text-on-surface-variant">
        변경된 파일이 없어요.
      </p>
    );

  return (
    <ul className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
      {files.map((file) => (
        <li key={file.filename} className="flex flex-col gap-2 p-3">
          <span className="typography-subtext-large break-all text-on-surface">
            {file.filename}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{file.status}</Badge>
            <span
              className="typography-subtext-medium text-primary"
              aria-label={`${file.additions}줄 추가`}
            >
              +{file.additions}
            </span>
            <span
              className="typography-subtext-medium text-error"
              aria-label={`${file.deletions}줄 삭제`}
            >
              -{file.deletions}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
