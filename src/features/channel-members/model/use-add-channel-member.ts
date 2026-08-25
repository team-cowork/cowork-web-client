'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { postChannelMember } from '@/entities/channel/api/post-channel-member';

export function useAddChannelMember(channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => postChannelMember(channelId, { userId }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: channelQueries.members(channelId).queryKey,
      }),
  });
}
