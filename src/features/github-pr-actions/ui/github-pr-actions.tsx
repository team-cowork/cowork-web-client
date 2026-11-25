'use client';

import { useState } from 'react';

import { useApprovePull } from '@/features/github-pr-actions/model/use-approve-pull';
import { useClosePull } from '@/features/github-pr-actions/model/use-close-pull';
import { useMergePull } from '@/features/github-pr-actions/model/use-merge-pull';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

interface GithubPrActionsProps {
  projectId: number;
  repoId: number;
  prNumber: number;
  /** 머지할 수 없는 이유. 값이 있으면 머지 버튼을 막고 이유를 보여준다. */
  mergeBlockedReason?: string;
}

export function GithubPrActions({
  projectId,
  repoId,
  prNumber,
  mergeBlockedReason,
}: GithubPrActionsProps) {
  const [confirm, setConfirm] = useState<'merge' | 'close' | null>(null);
  const approve = useApprovePull(projectId, repoId, prNumber);
  const merge = useMergePull(projectId, repoId, prNumber);
  const close = useClosePull(projectId, repoId, prNumber);
  const pending = approve.isPending || merge.isPending || close.isPending;

  return (
    <>
      {mergeBlockedReason && (
        <p className="mr-auto self-center typography-subtext-medium text-on-surface-variant">
          {mergeBlockedReason}
        </p>
      )}
      <Button
        size="S"
        variant="weak"
        color="neutral"
        disabled={pending}
        onClick={() => setConfirm('close')}
      >
        {close.isPending ? '처리하는 중이에요…' : '닫기'}
      </Button>
      <Button
        size="S"
        variant="weak"
        disabled={pending}
        onClick={() => approve.mutate()}
      >
        {approve.isPending ? '처리하는 중이에요…' : '승인하기'}
      </Button>
      <Button
        size="S"
        disabled={pending || mergeBlockedReason !== undefined}
        onClick={() => setConfirm('merge')}
      >
        {merge.isPending ? '처리하는 중이에요…' : '머지하기'}
      </Button>
      <Dialog
        open={confirm === 'merge'}
        onClose={() => {
          if (!merge.isPending) setConfirm(null);
        }}
        title="이 PR을 스쿼시 머지할까요?"
        description="여러 커밋을 하나로 합치는 squash merge를 요청해요. 요청한 뒤 PR 상태를 다시 확인해 결과를 알려 드려요."
      >
        <Button
          variant="weak"
          color="neutral"
          disabled={merge.isPending}
          onClick={() => setConfirm(null)}
        >
          취소
        </Button>
        <Button
          disabled={pending}
          onClick={() =>
            merge.mutate(undefined, { onSuccess: () => setConfirm(null) })
          }
        >
          {merge.isPending ? '처리하는 중이에요…' : '스쿼시 머지하기'}
        </Button>
      </Dialog>
      <Dialog
        open={confirm === 'close'}
        onClose={() => {
          if (!close.isPending) setConfirm(null);
        }}
        title="이 PR을 머지하지 않고 닫을까요?"
        description="닫은 PR은 GitHub에서 다시 열 수 있어요. 요청한 뒤 PR 상태를 다시 확인해 결과를 알려 드려요."
      >
        <Button
          variant="weak"
          color="neutral"
          disabled={close.isPending}
          onClick={() => setConfirm(null)}
        >
          취소
        </Button>
        <Button
          color="danger"
          disabled={pending}
          onClick={() =>
            close.mutate(undefined, { onSuccess: () => setConfirm(null) })
          }
        >
          {close.isPending ? '처리하는 중이에요…' : '닫기'}
        </Button>
      </Dialog>
    </>
  );
}
