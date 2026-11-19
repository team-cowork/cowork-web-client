'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getHttpErrorMessage, getHttpStatus } from '@/shared/api/http-error';
import { githubQueries } from '@/entities/github/api/github-queries';
import { postGithubPullClose } from '@/entities/github/api/post-github-pull-close';
import { waitForPullState } from '@/features/github-pr-actions/model/wait-for-pull-state';
import { useToast } from '@/shared/ui/toast-provider';

export function useClosePull(
  projectId: number,
  repoId: number,
  prNumber: number,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      await postGithubPullClose(projectId, repoId, prNumber);
      // 머지와 같이 PR 상태를 다시 조회해 실제로 닫혔는지 확인한다.
      return waitForPullState(
        queryClient,
        projectId,
        repoId,
        prNumber,
        (pull) => pull.state !== 'open',
      );
    },
    onSuccess: (closed) => {
      toast(
        closed
          ? 'PR을 닫았어요'
          : '닫은 것을 아직 확인하지 못했어요. GitHub에서 PR 상태를 확인해 주세요',
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
            ? '이 PR을 닫을 권한이 없어요.'
            : status === 404
              ? 'PR을 찾지 못했어요. 목록을 새로 고친 뒤 다시 시도해 주세요.'
              : status === 409
                ? getHttpErrorMessage(error, '이미 닫혔거나 머지된 PR이에요.')
                : '닫기 요청을 보내지 못했어요. 다시 시도해 주세요.',
      );
    },
  });
}
