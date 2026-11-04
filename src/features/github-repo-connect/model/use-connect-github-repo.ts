'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { githubQueries } from '@/entities/github/api/github-queries';
import { postProjectGithubRepo } from '@/entities/github/api/post-project-github-repo';
import { useToast } from '@/shared/ui/toast-provider';

export function useConnectGithubRepo(
  projectId: number,
  onNeedsInstallation: () => void,
  onClose: () => void,
) {
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
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 400) {
        onNeedsInstallation();
      } else {
        toast(
          status === 409
            ? '팀의 다른 프로젝트에 이미 연결된 저장소예요.'
            : '저장소를 연결하지 못했어요. 다시 시도해 주세요.',
        );
      }
    },
  });
}
