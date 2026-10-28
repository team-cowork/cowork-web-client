'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  applyChannelOrder,
  type ChannelMove,
} from '@/features/channel-reorder/lib/reorder-channels';
import { channelQueries } from '@/entities/channel/api/channel-queries';
import { patchChannel } from '@/entities/channel/api/patch-channel';
import { patchTeamChannelsOrder } from '@/entities/channel/api/patch-team-channels-order';
import { type Channel } from '@/entities/channel/model/channel';
import { projectQueries } from '@/entities/project/api/project-queries';
import { useToast } from '@/shared/ui/toast-provider';

/**
 * 채널을 다른 프로젝트(또는 미소속)로 옮기고 놓은 위치대로 순서를 맞춘다.
 * 서버는 소속 변경과 순서 변경을 따로 받으므로 소속을 먼저 바꾼다.
 */
export function useMoveChannel(teamId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { queryKey } = channelQueries.byTeam(teamId);

  return useMutation({
    mutationFn: async ({
      channelId,
      projectId,
      orderedChannelIds,
    }: ChannelMove) => {
      // `projectId: null`을 그대로 보내야 서버가 프로젝트 배정을 해제한다.
      await patchChannel(channelId, { projectId });
      return patchTeamChannelsOrder(teamId, { orderedChannelIds });
    },
    onMutate: async ({ channelId, projectId, orderedChannelIds }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Channel[]>(queryKey);

      if (previous) {
        queryClient.setQueryData<Channel[]>(
          queryKey,
          applyChannelOrder(
            previous.map((channel) =>
              channel.id === channelId ? { ...channel, projectId } : channel,
            ),
            orderedChannelIds,
          ),
        );
      }

      return { previous };
    },
    onError: (_error, _move, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Channel[]>(queryKey, context.previous);
      }
      // 소속은 바뀌고 순서 저장만 실패했을 수 있어 서버 상태를 다시 받는다.
      void queryClient.invalidateQueries({ queryKey });
      toast('채널을 옮기지 못했어요');
    },
    onSuccess: (channels) => {
      queryClient.setQueryData<Channel[]>(queryKey, channels);
    },
    onSettled: (_data, _error, { channelId }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: channelQueries.detail(channelId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: [...projectQueries.all(), 'channels'],
        }),
      ]),
  });
}
