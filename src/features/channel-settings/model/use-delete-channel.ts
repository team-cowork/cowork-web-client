'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { deleteChannel } from '@/entities/channel/api/delete-channel';

export function useDeleteChannel(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChannel,
    onSuccess: (_, channelId) => {
      queryClient.removeQueries({
        queryKey: channelQueries.detail(channelId).queryKey,
      });
      return queryClient.invalidateQueries({
        queryKey: channelQueries.byTeam(teamId).queryKey,
      });
    },
  });
}
