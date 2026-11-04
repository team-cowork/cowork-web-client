'use client';

import { useQuery } from '@tanstack/react-query';

import { getGithubPull } from '@/entities/github/api/get-github-pull';
import { getGithubPullFiles } from '@/entities/github/api/get-github-pull-files';
import { githubQueries } from '@/entities/github/api/github-queries';
import { GithubPrActions } from '@/features/github-pr-actions/ui/github-pr-actions';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { Markdown } from '@/shared/ui/markdown';
import { Modal } from '@/shared/ui/modal';

interface GithubPrDetailModalProps {
  projectId: number;
  repoId: number;
  prNumber: number;
  canWrite: boolean;
  onClose: () => void;
}

export function GithubPrDetailModal({
  projectId,
  repoId,
  prNumber,
  canWrite,
  onClose,
}: GithubPrDetailModalProps) {
  const pull = useQuery({
    queryKey: githubQueries.pull(projectId, repoId, prNumber),
    queryFn: () => getGithubPull(projectId, repoId, prNumber),
  });
  const files = useQuery({
    queryKey: githubQueries.pullFiles(projectId, repoId, prNumber),
    queryFn: () => getGithubPullFiles(projectId, repoId, prNumber),
  });
  const githubUrl = pull.data?.htmlUrl;
  const safeGithubUrl =
    githubUrl && /^https:\/\/github\.com\//.test(githubUrl)
      ? githubUrl
      : undefined;

  return (
    <Modal
      open
      onClose={onClose}
      title={`PR #${prNumber}`}
      className="w-[720px]"
      footer={
        pull.data && !pull.isError && canWrite ? (
          <GithubPrActions
            projectId={projectId}
            repoId={repoId}
            prNumber={prNumber}
          />
        ) : undefined
      }
    >
      {pull.isPending ? (
        <p
          role="status"
          className="typography-subtext-medium text-on-surface-variant"
        >
          PR 상세를 불러오는 중이에요…
        </p>
      ) : pull.isError ? (
        <ErrorState
          title="PR 상세를 불러오지 못했어요"
          action={
            <Button onClick={() => void pull.refetch()}>다시 시도</Button>
          }
        />
      ) : (
        <>
          <h3 className="typography-title-small break-words text-on-surface">
            {pull.data.title}
          </h3>
          <p className="typography-subtext-large break-all text-on-surface-variant">
            작성자 {pull.data.author}
          </p>
          <p className="typography-subtext-medium break-all text-on-surface-variant">
            {pull.data.headRef} → {pull.data.baseRef}
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
            {pull.data.body ? (
              <Markdown
                variant="document"
                className="typography-subtext-large text-on-surface"
              >
                {pull.data.body}
              </Markdown>
            ) : (
              <p className="typography-subtext-medium text-on-surface-variant">
                작성된 설명이 없어요.
              </p>
            )}
          </section>
        </>
      )}
      <section className="flex min-w-0 flex-col gap-3">
        <h3 className="typography-label-medium text-on-surface">변경된 파일</h3>
        {files.isPending ? (
          <p
            role="status"
            className="typography-subtext-medium text-on-surface-variant"
          >
            변경된 파일을 불러오는 중이에요…
          </p>
        ) : files.isError ? (
          <ErrorState
            title="변경된 파일을 불러오지 못했어요"
            action={
              <Button onClick={() => void files.refetch()}>다시 시도</Button>
            }
          />
        ) : files.data.length === 0 ? (
          <p className="typography-subtext-medium text-on-surface-variant">
            변경된 파일이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
            {files.data.map((file) => (
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
        )}
      </section>
    </Modal>
  );
}
