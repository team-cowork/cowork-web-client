'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { deleteChannel } from '@/entities/channel/api/delete-channel';
import { useLastChannelStore } from '@/entities/channel/model/last-channel-store';

export function useDeleteChannel(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChannel,
    onSuccess: (_, channelId) => {
      useLastChannelStore.getState().clearLastChannelId(teamId, channelId);
      queryClient.removeQueries({
        queryKey: channelQueries.detail(channelId).queryKey,
      });
      return queryClient.invalidateQueries({
        queryKey: channelQueries.byTeam(teamId).queryKey,
      });
    },
  });
}
