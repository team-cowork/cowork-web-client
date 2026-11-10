'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteMessage } from '@/entities/message/api/delete-message';
import { type Message } from '@/entities/message/model/message';
import { removeMessage } from '@/entities/message/model/message-cache';

export function useDeleteMessage(message: Message) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteMessage(message.channelId, message._id),
    onSuccess: () => {
      removeMessage(queryClient, message.channelId, message._id);
    },
  });
}
