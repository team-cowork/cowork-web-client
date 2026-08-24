'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { patchTeamChannelsOrder } from '@/entities/channel/api/patch-team-channels-order';

export function useReorderChannels(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedChannelIds: number[]) =>
      patchTeamChannelsOrder(teamId, { orderedChannelIds }),
    onSuccess: (channels) => {
      queryClient.setQueryData(
        channelQueries.byTeam(teamId).queryKey,
        channels,
      );
    },
  });
}
