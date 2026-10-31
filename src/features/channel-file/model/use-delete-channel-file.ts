'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteChannelFile } from '@/entities/message/api/delete-channel-file';
import { messageQueries } from '@/entities/message/api/message-queries';
import { type ChannelFile } from '@/entities/message/model/message';
import { removeMessage } from '@/entities/message/model/message-cache';

/** 파일을 지우면 그 파일이 든 메시지도 함께 지워진다. */
export function useDeleteChannelFile(channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: ChannelFile) =>
      deleteChannelFile(channelId, file.fileId),
    onSuccess: (_data, file) => {
      removeMessage(queryClient, channelId, file.messageId);
      return queryClient.invalidateQueries({
        queryKey: messageQueries.channelFiles(channelId).queryKey,
      });
    },
  });
}
