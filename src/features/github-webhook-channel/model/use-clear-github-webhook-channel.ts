'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteGithubWebhookChannel } from '@/entities/github/api/delete-github-webhook-channel';
import { githubQueries } from '@/entities/github/api/github-queries';
import { useToast } from '@/shared/ui/toast-provider';

export function useClearGithubWebhookChannel(
  projectId: number,
  repoId: number,
  onClose: () => void,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => deleteGithubWebhookChannel(projectId, repoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: githubQueries.projectRepos(projectId).queryKey,
      });
      toast('GitHub 알림을 해제했어요.');
      onClose();
    },
    onError: () => toast('알림 채널을 변경하지 못했어요. 다시 시도해 주세요.'),
  });
}
