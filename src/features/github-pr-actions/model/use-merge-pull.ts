'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getHttpErrorMessage, getHttpStatus } from '@/shared/api/http-error';
import { githubQueries } from '@/entities/github/api/github-queries';
import { postGithubPullMerge } from '@/entities/github/api/post-github-pull-merge';
import { waitForPullState } from '@/features/github-pr-actions/model/wait-for-pull-state';
import { useToast } from '@/shared/ui/toast-provider';

export function useMergePull(
  projectId: number,
  repoId: number,
  prNumber: number,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      await postGithubPullMerge(projectId, repoId, prNumber);
      // 응답이 성공이어도 실제로 머지됐는지는 PR 상태를 다시 조회해 확인한다.
      return waitForPullState(
        queryClient,
        projectId,
        repoId,
        prNumber,
        (pull) => pull.state !== 'open',
      );
    },
    onSuccess: (merged) => {
      toast(
        merged
          ? 'PR을 머지했어요'
          : '머지가 처리되지 않았어요. GitHub에서 PR 상태를 확인해 주세요',
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
            ? '이 PR을 머지할 권한이 없어요.'
            : status === 409
              ? getHttpErrorMessage(
                  error,
                  '충돌이 있거나 이미 처리된 PR이라 머지할 수 없어요.',
                )
              : '머지 요청을 보내지 못했어요. 다시 시도해 주세요.',
      );
    },
  });
}
