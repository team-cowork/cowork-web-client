'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { deleteChannelMember } from '@/entities/channel/api/delete-channel-member';

export function useRemoveChannelMember(channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => deleteChannelMember(channelId, memberId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: channelQueries.members(channelId).queryKey,
      }),
  });
}
