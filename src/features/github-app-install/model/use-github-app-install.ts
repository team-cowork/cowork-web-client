'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTeamGithubInstallation } from '@/entities/github/api/delete-team-github-installation';
import { getTeamGithubInstallUrl } from '@/entities/github/api/get-team-github-install-url';
import { githubQueries } from '@/entities/github/api/github-queries';
import { useToast } from '@/shared/ui/toast-provider';

export function useGithubAppInstall(teamId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const install = useMutation({
    mutationFn: () => getTeamGithubInstallUrl(teamId),
    onSuccess: ({ installUrl }) => window.location.assign(installUrl),
    onError: () =>
      toast('GitHub App 설치 주소를 불러오지 못했어요. 다시 시도해 주세요.'),
  });

  const uninstall = useMutation({
    mutationFn: () => deleteTeamGithubInstallation(teamId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: githubQueries.all() });
      toast('GitHub 연동을 해제했어요.');
    },
    onError: () =>
      toast('GitHub 연동을 해제하지 못했어요. 다시 시도해 주세요.'),
  });

  return { install, uninstall };
}
