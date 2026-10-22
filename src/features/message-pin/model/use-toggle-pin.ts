'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePin } from '@/entities/message/api/delete-pin';
import { postPin } from '@/entities/message/api/post-pin';
import { type Message } from '@/entities/message/model/message';
import { setMessagePinned } from '@/entities/message/model/message-cache';

export function useTogglePin(message: Message) {
  const queryClient = useQueryClient();
  const { channelId, _id: messageId, isPinned } = message;

  return useMutation({
    mutationFn: () =>
      isPinned
        ? deletePin(channelId, messageId)
        : postPin(channelId, messageId),
    onSuccess: () =>
      setMessagePinned(queryClient, channelId, messageId, !isPinned),
  });
}
