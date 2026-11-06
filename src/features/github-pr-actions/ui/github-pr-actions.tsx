'use client';

import { useState } from 'react';

import { useApprovePull } from '@/features/github-pr-actions/model/use-approve-pull';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const approve = useApprovePull(projectId, repoId, prNumber);
  const merge = useMergePull(projectId, repoId, prNumber);
  const pending = approve.isPending || merge.isPending;

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
        disabled={pending}
        onClick={() => approve.mutate()}
      >
        {approve.isPending ? '요청을 보내는 중이에요…' : '승인하기'}
      </Button>
      <Button
        size="S"
        disabled={pending || mergeBlockedReason !== undefined}
        onClick={() => setConfirmOpen(true)}
      >
        {merge.isPending ? '요청을 보내는 중이에요…' : '머지하기'}
      </Button>
      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!merge.isPending) setConfirmOpen(false);
        }}
        title="이 PR을 스쿼시 머지할까요?"
        description="여러 커밋을 하나로 합치는 squash merge를 요청해요. 비동기로 처리되니 결과는 GitHub에서 확인해 주세요."
      >
        <Button
          variant="weak"
          color="neutral"
          disabled={merge.isPending}
          onClick={() => setConfirmOpen(false)}
        >
          취소
        </Button>
        <Button
          disabled={pending}
          onClick={() =>
            merge.mutate(undefined, { onSuccess: () => setConfirmOpen(false) })
          }
        >
          {merge.isPending ? '요청을 보내는 중이에요…' : '스쿼시 머지 요청하기'}
        </Button>
      </Dialog>
    </>
  );
}
