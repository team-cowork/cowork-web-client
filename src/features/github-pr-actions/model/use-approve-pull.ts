'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getHttpErrorMessage, getHttpStatus } from '@/shared/api/http-error';
import { githubQueries } from '@/entities/github/api/github-queries';
import { postGithubPullApprove } from '@/entities/github/api/post-github-pull-approve';
import { waitForPullState } from '@/features/github-pr-actions/model/wait-for-pull-state';
import { useToast } from '@/shared/ui/toast-provider';

export function useApprovePull(
  projectId: number,
  repoId: number,
  prNumber: number,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // reviewDecision은 리뷰어별 마지막 리뷰로 계산하고 CHANGES_REQUESTED가 APPROVED보다 우선한다.
      // 그래서 요청 전 리뷰가 없던(null) PR에서만 APPROVED로 바뀌는 것으로 내 승인을 판정할 수 있다.
      // 이미 리뷰가 있거나 캐시에 상세가 없으면(undefined) 반영 여부를 알 수 없다.
      const before = queryClient.getQueryData(
        githubQueries.pull(projectId, repoId, prNumber).queryKey,
      )?.reviewDecision;
      await postGithubPullApprove(projectId, repoId, prNumber);
      if (before !== null) return 'unknown' as const;

      const approved = await waitForPullState(
        queryClient,
        projectId,
        repoId,
        prNumber,
        (pull) => pull.reviewDecision === 'APPROVED',
      );
      return approved ? ('approved' as const) : ('unconfirmed' as const);
    },
    onSuccess: (result) => {
      // 다시 조회에 실패해도 false가 되므로 "처리되지 않았다"고 단정하지 않는다.
      toast(
        result === 'approved'
          ? 'PR을 승인했어요'
          : result === 'unknown'
            ? '승인 요청을 보냈어요. 이미 리뷰가 있는 PR이라 내 승인은 GitHub에서 확인해 주세요'
            : '승인됐는지 아직 확인하지 못했어요. GitHub에서 PR 상태를 확인해 주세요',
      );
      void queryClient.invalidateQueries({
        queryKey: githubQueries.pulls(projectId, repoId),
      });
    },
    onError: (error) => {
      const status = getHttpStatus(error);
      toast(
        status === 400
          ? '저장소 또는 내 GitHub 계정이 연결되어 있지 않아요. 연결 상태를 확인한 뒤 다시 시도해 주세요.'
          : status === 403
            ? '이 PR을 승인할 권한이 없거나 내가 올린 PR이에요.'
            : status === 409
              ? getHttpErrorMessage(error, '이미 닫혔거나 머지된 PR이에요.')
              : '승인 요청을 보내지 못했어요. 다시 시도해 주세요.',
      );
    },
  });
}
