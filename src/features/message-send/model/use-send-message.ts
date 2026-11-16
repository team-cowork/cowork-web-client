'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';

import { messageQueries } from '@/entities/message/api/message-queries';
import { postMessage } from '@/entities/message/api/post-message';
import { toAttachmentContent } from '@/entities/message/lib/attachment-content';
import {
  type ConfirmedFile,
  type Message,
} from '@/entities/message/model/message';
import {
  hasMessage,
  isMessagePending,
  refetchChannelMessages,
  upsertMessage,
} from '@/entities/message/model/message-cache';
import { toMentionedMessage } from '@/entities/message/lib/message-pages';
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

  // 파일 공유 화면은 메시지 목록 대신 파일 목록을 보므로, 소켓 이벤트만 기다리지 않고 직접 갱신한다
  const refreshFiles = () =>
    queryClient.invalidateQueries({
      queryKey: messageQueries.channelFiles(channelId).queryKey,
    });

  const { mutate, mutateAsync } = useMutation({
    mutationFn: (message: Message) =>
      postMessage(channelId, {
        content: message.content,
        type: message.attachments.length > 0 ? 'FILE' : 'TEXT',
        attachments: message.attachments.flatMap(({ objectKey }) =>
          objectKey ? [{ objectKey }] : [],
        ),
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
      const hasAttachments = message.attachments.length > 0;

      setTimeout(async () => {
        // 서버는 접수 뒤 저장하므로, 저장이 끝났을 즈음 파일 목록을 한 번 더 받는다
        if (hasAttachments) void refreshFiles();
        if (!isMessagePending(queryClient, message)) return;

        await refetchChannelMessages(queryClient, channelId);
        // 접수는 됐지만 서버가 저장 단계에서 버린 메시지는 조용히 사라지지 않게 실패로 남긴다.
        if (!hasMessage(queryClient, message)) {
          upsertMessage(queryClient, { ...message, sendStatus: 'failed' });
        }
      }, DELIVERY_TIMEOUT_MS);

      if (hasAttachments) return refreshFiles();
    },
  });

  const toMessage = (
    content: string,
    attachments: ConfirmedFile[],
  ): Message => {
    const clientMessageId = createUuid();
    const now = new Date().toISOString();

    return {
      _id: clientMessageId,
      teamId: null,
      projectId: null,
      channelId,
      authorId: me.id,
      content: content || toAttachmentContent(attachments),
      type: attachments.length > 0 ? 'FILE' : 'TEXT',
      attachments,
      parentMessageId: parentMessage?._id ?? null,
      isEdited: false,
      isPinned: false,
      clientMessageId,
      mentions: [],
      reactions: [],
      createdAt: now,
      updatedAt: now,
      mentionedMessage: parentMessage
        ? toMentionedMessage(parentMessage)
        : null,
    };
  };

  const send = (content: string, attachments: ConfirmedFile[] = []) =>
    mutate(toMessage(content, attachments));

  /** 서버가 접수할 때까지 기다린다. 결과를 화면에 직접 알려야 할 때 쓴다 */
  const sendAsync = async (
    content: string,
    attachments: ConfirmedFile[] = [],
  ) => {
    await mutateAsync(toMessage(content, attachments));
  };

  const retry = (message: Message) => mutate(message);

  return { send, sendAsync, retry };
}
