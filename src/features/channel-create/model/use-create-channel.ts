'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { postChannel } from '@/entities/channel/api/post-channel';

export function useCreateChannel(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postChannel,
    onSuccess: (channel) => {
      queryClient.setQueryData(
        channelQueries.detail(channel.id).queryKey,
        channel,
      );
      return queryClient.invalidateQueries({
        queryKey: channelQueries.byTeam(teamId).queryKey,
      });
    },
  });
}
