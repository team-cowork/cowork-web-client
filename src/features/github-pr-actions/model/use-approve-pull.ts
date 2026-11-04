'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { githubQueries } from '@/entities/github/api/github-queries';
import { postGithubPullApprove } from '@/entities/github/api/post-github-pull-approve';
import { useToast } from '@/shared/ui/toast-provider';

export function useApprovePull(
  projectId: number,
  repoId: number,
  prNumber: number,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => postGithubPullApprove(projectId, repoId, prNumber),
    onSuccess: () => {
      // 비동기 요청 접수이므로 승인·머지 완료로 표시하지 않아요.
      toast('요청을 보냈어요. 결과는 GitHub에서 확인해 주세요');
      void queryClient.invalidateQueries({
        queryKey: githubQueries.pullBoard(projectId, repoId),
      });
      void queryClient.invalidateQueries({
        queryKey: githubQueries.pull(projectId, repoId, prNumber),
      });
    },
    onError: (error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      toast(
        status === 400
          ? '저장소 또는 내 GitHub 계정이 연결되어 있지 않아요. 연결 상태를 확인한 뒤 다시 시도해 주세요.'
          : status === 403
            ? '이 PR을 승인할 권한이 없어요.'
            : '승인 요청을 보내지 못했어요. 다시 시도해 주세요.',
      );
    },
  });
}
