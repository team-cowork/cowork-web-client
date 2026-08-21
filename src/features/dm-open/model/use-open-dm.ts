'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { postDm } from '@/entities/channel/api/post-dm';
import { dmQueries } from '@/entities/dm/api/dm-queries';

export function useOpenDm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postDm,
    onSuccess: (channel) => {
      queryClient.setQueryData(channelQueries.detail(channel.id).queryKey, channel);
      return queryClient.invalidateQueries({ queryKey: dmQueries.list().queryKey });
    },
  });
}
