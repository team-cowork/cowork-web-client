'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { patchChannel } from '@/entities/channel/api/patch-channel';
import { type UpdateChannelRequest } from '@/entities/channel/model/channel';

export function useUpdateChannel(channelId: number, teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateChannelRequest) =>
      patchChannel(channelId, request),
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
