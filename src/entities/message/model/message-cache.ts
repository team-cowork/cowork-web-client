import { type QueryClient } from '@tanstack/react-query';

import { messageQueries } from '@/entities/message/api/message-queries';
import {
  findInPages,
  isSameMessage,
  toMentionedMessage,
  upsertIntoPages,
  upsertNewestFirst,
} from '@/entities/message/lib/message-pages';
import {
  type ConfirmedFile,
  type Message,
  type MessageReaction,
  type Thread,
} from '@/entities/message/model/message';

/**
 * 메시지를 채널 목록에, 스레드 메시지면 그 스레드 캐시에만 넣는다.
 * 같은 `_id` 또는 `clientMessageId`가 있으면 교체해 낙관적 메시지를 실제 메시지로 바꾼다.
 */
export function upsertMessage(queryClient: QueryClient, message: Message) {
  const { channelId, parentMessageId, threadId } = message;

  if (threadId != null) {
    queryClient.setQueryData(
      messageQueries.thread(channelId, threadId).queryKey,
      (messages) => messages && upsertNewestFirst(messages, message),
    );
    return;
  }

  queryClient.setQueryData(
    messageQueries.byChannel(channelId).queryKey,
    (data) => {
      if (!data) return data;

      const parent =
        parentMessageId !== null && message.mentionedMessage == null
          ? findInPages(data, parentMessageId)
          : undefined;

      return upsertIntoPages(
        data,
        parent
          ? { ...message, mentionedMessage: toMentionedMessage(parent) }
          : message,
      );
    },
  );
}

export function upsertThread(queryClient: QueryClient, thread: Thread) {
  queryClient.setQueryData(
    messageQueries.threads(thread.channelId).queryKey,
    (threads) =>
      threads && [
        ...threads.filter((cached) => cached.id !== thread.id),
        thread,
      ],
  );
}

export function removeThread(
  queryClient: QueryClient,
  channelId: number,
  threadId: number,
) {
  queryClient.setQueryData(
    messageQueries.threads(channelId).queryKey,
    (threads) => threads?.filter((thread) => thread.id !== threadId),
  );
}

function mapChannelMessages(
  queryClient: QueryClient,
  channelId: number,
  transform: (messages: Message[]) => Message[],
  includePins = false,
) {
  queryClient.setQueryData(
    messageQueries.byChannel(channelId).queryKey,
    (data) => data && { ...data, pages: data.pages.map(transform) },
  );
  queryClient.setQueriesData<Message[]>(
    { queryKey: messageQueries.threadPrefix(channelId) },
    (messages) => messages && transform(messages),
  );
  if (includePins) {
    queryClient.setQueryData(
      messageQueries.pins(channelId).queryKey,
      (pins) => pins && transform(pins),
    );
  }
}

export function editMessageContent(
  queryClient: QueryClient,
  channelId: number,
  messageId: string,
  content: string,
) {
  mapChannelMessages(
    queryClient,
    channelId,
    (messages) =>
      messages.map((message) => {
        if (message._id === messageId) {
          return { ...message, content, isEdited: true };
        }
        if (message.mentionedMessage?._id === messageId) {
          return {
            ...message,
            mentionedMessage: { ...message.mentionedMessage, content },
          };
        }
        return message;
      }),
    true,
  );
}

export function removeMessage(
  queryClient: QueryClient,
  channelId: number,
  messageId: string,
) {
  mapChannelMessages(
    queryClient,
    channelId,
    (messages) =>
      messages
        .filter((message) => message._id !== messageId)
        .map((message) =>
          message.mentionedMessage?._id === messageId
            ? { ...message, mentionedMessage: null }
            : message,
        ),
    true,
  );
  queryClient.setQueryData(
    messageQueries.channelFiles(channelId).queryKey,
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          files: page.files.filter((file) => file.messageId !== messageId),
        })),
      },
  );
}

export interface ReactionChange {
  emoji: string;
  /** 변경 후 반응 수. 0이면 반응을 목록에서 뺀다. */
  count: number;
  /** 내 반응 여부가 바뀔 때만 넘긴다. 다른 사람의 반응이면 기존 값을 유지한다. */
  myReaction?: boolean;
}

export function applyReaction(
  queryClient: QueryClient,
  channelId: number,
  messageId: string,
  { emoji, count, myReaction }: ReactionChange,
) {
  const apply = (reactions: MessageReaction[]): MessageReaction[] => {
    const current = reactions.find((reaction) => reaction.emoji === emoji);
    if (count <= 0) {
      return reactions.filter((reaction) => reaction.emoji !== emoji);
    }

    const next = {
      emoji,
      count,
      myReaction: myReaction ?? current?.myReaction ?? false,
    };
    return current
      ? reactions.map((reaction) =>
          reaction.emoji === emoji ? next : reaction,
        )
      : [...reactions, next];
  };

  mapChannelMessages(queryClient, channelId, (messages) =>
    messages.map((message) =>
      message._id === messageId
        ? { ...message, reactions: apply(message.reactions) }
        : message,
    ),
  );
}

export function setMessagePinned(
  queryClient: QueryClient,
  channelId: number,
  messageId: string,
  isPinned: boolean,
) {
  mapChannelMessages(queryClient, channelId, (messages) =>
    messages.map((message) =>
      message._id === messageId ? { ...message, isPinned } : message,
    ),
  );

  return queryClient.invalidateQueries({
    queryKey: messageQueries.pins(channelId).queryKey,
  });
}

function findCachedMessage(queryClient: QueryClient, message: Message) {
  const { channelId, threadId } = message;
  const messages =
    threadId != null
      ? queryClient.getQueryData(
          messageQueries.thread(channelId, threadId).queryKey,
        )
      : queryClient
          .getQueryData(messageQueries.byChannel(channelId).queryKey)
          ?.pages.flat();

  return messages?.find((cached) => isSameMessage(cached, message));
}

/** 전송 상태와 관계없이 채널 목록(스레드 메시지면 스레드)에 이 메시지가 있는지 */
export function hasMessage(
  queryClient: QueryClient,
  message: Message,
): boolean {
  return findCachedMessage(queryClient, message) !== undefined;
}

export function isMessagePending(
  queryClient: QueryClient,
  message: Message,
): boolean {
  return findCachedMessage(queryClient, message)?.sendStatus === 'pending';
}

// 전송 타임아웃 판정은 메시지 목록만 기다리면 되므로, 고정 메시지·파일 목록은
// 갱신만 요청하고 기다리지 않는다
export function refetchChannelMessages(
  queryClient: QueryClient,
  channelId: number,
) {
  void queryClient.invalidateQueries({
    queryKey: messageQueries.pins(channelId).queryKey,
    exact: true,
  });
  void queryClient.invalidateQueries({
    queryKey: messageQueries.channelFiles(channelId).queryKey,
    exact: true,
  });
  void queryClient.invalidateQueries({
    queryKey: messageQueries.threads(channelId).queryKey,
    exact: true,
  });

  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: messageQueries.byChannel(channelId).queryKey,
    }),
    queryClient.invalidateQueries({
      queryKey: messageQueries.threadPrefix(channelId),
    }),
  ]);
}

/**
 * 보낸 첨부가 모두 파일 목록 캐시에 올라왔는지.
 * 목록 응답에 `objectKey`가 없으면 올린 사람·이름·크기로 맞춘다.
 */
export function hasChannelFiles(
  queryClient: QueryClient,
  channelId: number,
  attachments: ConfirmedFile[],
  uploaderId: number,
): boolean {
  const files =
    queryClient
      .getQueryData(messageQueries.channelFiles(channelId).queryKey)
      ?.pages.flatMap((page) => page.files) ?? [];

  return attachments.every((attachment) =>
    files.some((file) =>
      file.objectKey !== undefined
        ? file.objectKey === attachment.objectKey
        : file.uploaderId === uploaderId &&
          file.fileName === attachment.name &&
          file.fileSize === attachment.size,
    ),
  );
}
