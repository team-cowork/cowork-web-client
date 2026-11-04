'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProjectGithubRepo } from '@/entities/github/api/delete-project-github-repo';
import { githubQueries } from '@/entities/github/api/github-queries';
import { useToast } from '@/shared/ui/toast-provider';

export function useDisconnectGithubRepo(
  projectId: number,
  repoId: number,
  onSuccess: () => void,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => deleteProjectGithubRepo(projectId, repoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: githubQueries.projectRepos(projectId),
      });
      toast('저장소 연결을 해제했어요.');
      onSuccess();
    },
    onError: () => toast('연결을 해제하지 못했어요. 다시 시도해 주세요.'),
  });
}
