'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchMessage } from '@/entities/message/api/patch-message';
import { type Message } from '@/entities/message/model/message';
import { editMessageContent } from '@/entities/message/model/message-cache';

export function useEditMessage(message: Message) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      patchMessage(message.channelId, message._id, { content }),
    onSuccess: (updated) => {
      editMessageContent(
        queryClient,
        message.channelId,
        message._id,
        updated.content,
      );
    },
  });
}
