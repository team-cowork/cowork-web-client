'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchTeamIcon } from '@/entities/team/api/patch-team-icon';
import { teamQueries } from '@/entities/team/api/team-queries';
import { uploadTeamIcon } from '@/entities/team/lib/upload-team-icon';

export function useUpdateTeamIcon(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const iconUrl = await uploadTeamIcon(file);

      return patchTeamIcon(teamId, { iconUrl });
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamQueries.detail(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueries.list().queryKey,
        }),
      ]),
  });
}
