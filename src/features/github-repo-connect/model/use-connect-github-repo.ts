'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { githubQueries } from '@/entities/github/api/github-queries';
import { postProjectGithubRepo } from '@/entities/github/api/post-project-github-repo';
import { useToast } from '@/shared/ui/toast-provider';

export function useConnectGithubRepo(projectId: number, onClose: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (githubRepoUrl: string) =>
      postProjectGithubRepo(projectId, { githubRepoUrl }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: githubQueries.projectRepos(projectId).queryKey,
      });
      toast('저장소를 연결했어요.');
      onClose();
    },
    onError: (error) => {
      // 연결 요청의 400은 GitHub 미연동이 아니라 유효하지 않은 저장소 URL이에요.
      const status = isAxiosError(error) ? error.response?.status : undefined;
      toast(
        status === 400
          ? '연결할 수 없는 저장소 주소예요. 목록을 새로 불러온 뒤 다시 선택해 주세요.'
          : status === 409
            ? '팀의 다른 프로젝트에 이미 연결된 저장소예요.'
            : '저장소를 연결하지 못했어요. 다시 시도해 주세요.',
      );
    },
  });
}
