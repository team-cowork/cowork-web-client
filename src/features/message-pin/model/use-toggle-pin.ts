'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HttpStatusCode, isAxiosError } from 'axios';

import { deletePin } from '@/entities/message/api/delete-pin';
import { postPin } from '@/entities/message/api/post-pin';
import { type Message } from '@/entities/message/model/message';
import { setMessagePinned } from '@/entities/message/model/message-cache';
import { useToast } from '@/shared/ui/toast-provider';

/**
 * 고정은 작성자와 상관없이 채널의 메시지 고정 권한으로 정해진다.
 * 내 권한을 미리 알 수 없어 버튼은 모두에게 보여주고, 서버가 거부하면 알린다.
 */
export function useTogglePin(message: Message) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { channelId, _id: messageId, isPinned } = message;

  return useMutation({
    mutationFn: () =>
      isPinned
        ? deletePin(channelId, messageId)
        : postPin(channelId, messageId),
    onSuccess: () =>
      setMessagePinned(queryClient, channelId, messageId, !isPinned),
    onError: (error) => {
      const forbidden =
        isAxiosError(error) &&
        error.response?.status === HttpStatusCode.Forbidden;
      toast(
        forbidden
          ? '이 채널에서 메시지를 고정할 권한이 없어요'
          : isPinned
            ? '고정을 해제하지 못했어요'
            : '메시지를 고정하지 못했어요',
      );
    },
  });
}
