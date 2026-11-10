'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { githubQueries } from '@/entities/github/api/github-queries';
import { putGithubWebhookChannel } from '@/entities/github/api/put-github-webhook-channel';
import { projectQueries } from '@/entities/project/api/project-queries';
import { useToast } from '@/shared/ui/toast-provider';

export function useSetGithubWebhookChannel(
  projectId: number,
  repoId: number,
  onClose: () => void,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (channelId: number) =>
      putGithubWebhookChannel(projectId, repoId, { channelId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: githubQueries.projectRepos(projectId).queryKey,
      });
      toast('GitHub 알림 채널을 설정했어요.');
      onClose();
    },
    onError: (error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      toast(
        status === 400
          ? '이 프로젝트에 속한 채널만 선택할 수 있어요.'
          : status === 503
            ? 'GitHub 동기화가 진행 중이에요. 잠시 후 다시 시도해 주세요.'
            : '알림 채널을 변경하지 못했어요. 다시 시도해 주세요.',
      );
      if (status === 400)
        void queryClient.invalidateQueries({
          queryKey: projectQueries.channels(projectId).queryKey,
        });
    },
  });
}
