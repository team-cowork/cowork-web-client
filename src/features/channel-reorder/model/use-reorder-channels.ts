'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applyChannelOrder } from '@/features/channel-reorder/lib/reorder-channels';
import { channelQueries } from '@/entities/channel/api/channel-queries';
import { patchTeamChannelsOrder } from '@/entities/channel/api/patch-team-channels-order';
import { type Channel } from '@/entities/channel/model/channel';

export function useReorderChannels(teamId: number) {
  const queryClient = useQueryClient();
  const { queryKey } = channelQueries.byTeam(teamId);

  return useMutation({
    mutationFn: (orderedChannelIds: number[]) =>
      patchTeamChannelsOrder(teamId, { orderedChannelIds }),
    onMutate: async (orderedChannelIds) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Channel[]>(queryKey);

      if (previous) {
        queryClient.setQueryData<Channel[]>(
          queryKey,
          applyChannelOrder(previous, orderedChannelIds),
        );
      }

      return { previous };
    },
    onError: (_error, _orderedChannelIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Channel[]>(queryKey, context.previous);
      }
    },
    onSuccess: (channels) => {
      queryClient.setQueryData<Channel[]>(queryKey, channels);
    },
  });
}
