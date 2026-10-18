'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';

import { postMessage } from '@/entities/message/api/post-message';
import { type Message } from '@/entities/message/model/message';
import {
  isMessagePending,
  refetchChannelMessages,
  toMentionedMessage,
  upsertMessage,
} from '@/entities/message/model/message-cache';
import { userQueries } from '@/entities/user/api/user-queries';
import { createUuid } from '@/shared/lib/create-uuid';

// 전송이 접수된 뒤 이 시간 안에 소켓으로 저장된 메시지가 오지 않으면 목록을 다시 받는다.
const DELIVERY_TIMEOUT_MS = 5000;

/**
 * 메시지를 먼저 화면에 그린 뒤 전송한다(낙관적 업데이트).
 * `parentMessage`를 넘기면 그 메시지의 스레드 답글로 보낸다.
 */
export function useSendMessage(channelId: number, parentMessage?: Message) {
  const queryClient = useQueryClient();
  const { data: me } = useSuspenseQuery(userQueries.me());

  const { mutate } = useMutation({
    mutationFn: (message: Message) =>
      postMessage(channelId, {
        content: message.content,
        parentMessageId: message.parentMessageId ?? undefined,
        // 재시도에도 같은 키를 보내 서버가 중복 저장하지 않게 한다.
        clientMessageId: message.clientMessageId ?? message._id,
      }),
    onMutate: (message) => {
      upsertMessage(queryClient, { ...message, sendStatus: 'pending' });
    },
    onError: (_error, message) => {
      upsertMessage(queryClient, { ...message, sendStatus: 'failed' });
    },
    onSuccess: (_data, message) => {
      setTimeout(() => {
        if (isMessagePending(queryClient, message)) {
          void refetchChannelMessages(queryClient, channelId);
        }
      }, DELIVERY_TIMEOUT_MS);
    },
  });

  const send = (content: string) => {
    const clientMessageId = createUuid();
    const now = new Date().toISOString();

    mutate({
      _id: clientMessageId,
      teamId: null,
      projectId: null,
      channelId,
      authorId: me.id,
      content,
      type: 'TEXT',
      attachments: [],
      parentMessageId: parentMessage?._id ?? null,
      isEdited: false,
      isPinned: false,
      clientMessageId,
      mentions: [],
      createdAt: now,
      updatedAt: now,
      mentionedMessage: parentMessage
        ? toMentionedMessage(parentMessage)
        : null,
    });
  };

  const retry = (message: Message) => mutate(message);

  return { send, retry };
}
