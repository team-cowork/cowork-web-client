'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { patchChannel } from '@/entities/channel/api/patch-channel';
import { postChannel } from '@/entities/channel/api/post-channel';
import { type CreateChannelRequest } from '@/entities/channel/model/channel';
import { projectQueries } from '@/entities/project/api/project-queries';
import { useToast } from '@/shared/ui/toast-provider';

/**
 * 채널을 만든다. 서버의 채널 생성은 프로젝트를 받지 않아,
 * 프로젝트 그룹에서 만들면 미소속으로 만든 뒤 프로젝트를 지정한다.
 * 지정만 실패하면 채널은 미소속으로 남기고 알린다.
 */
export function useCreateChannel(teamId: number, projectId: number | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: CreateChannelRequest) => {
      const channel = await postChannel(request);
      if (projectId === null) return channel;

      try {
        return await patchChannel(channel.id, { projectId });
      } catch {
        toast(
          '채널은 만들었지만 프로젝트에 넣지 못했어요. 사이드바에서 끌어 옮겨 주세요',
        );
        return channel;
      }
    },
    onSuccess: (channel) => {
      queryClient.setQueryData(
        channelQueries.detail(channel.id).queryKey,
        channel,
      );
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: channelQueries.byTeam(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: [...projectQueries.all(), 'channels'],
        }),
      ]);
    },
  });
}
