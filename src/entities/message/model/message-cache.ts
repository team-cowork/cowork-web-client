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
  type Message,
  type MessageReaction,
} from '@/entities/message/model/message';

/**
 * 메시지를 채널 목록에, 답글이면 원본의 스레드 캐시에도 넣는다.
 * 같은 `_id` 또는 `clientMessageId`가 있으면 교체해 낙관적 메시지를 실제 메시지로 바꾼다.
 */
export function upsertMessage(queryClient: QueryClient, message: Message) {
  const { channelId, parentMessageId } = message;

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

  if (parentMessageId !== null) {
    queryClient.setQueryData(
      messageQueries.replies(channelId, parentMessageId).queryKey,
      (replies) => replies && upsertNewestFirst(replies, message),
    );
  }
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
    { queryKey: messageQueries.repliesPrefix(channelId) },
    (replies) => replies && transform(replies),
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

/** 전송 상태와 관계없이 채널 목록에 이 메시지가 있는지 */
export function hasMessage(
  queryClient: QueryClient,
  message: Message,
): boolean {
  const data = queryClient.getQueryData(
    messageQueries.byChannel(message.channelId).queryKey,
  );

  return (
    data?.pages.some((page) =>
      page.some((cached) => isSameMessage(cached, message)),
    ) ?? false
  );
}

export function isMessagePending(
  queryClient: QueryClient,
  message: Message,
): boolean {
  const data = queryClient.getQueryData(
    messageQueries.byChannel(message.channelId).queryKey,
  );

  return (
    data?.pages.some((page) =>
      page.some(
        (cached) =>
          cached.sendStatus === 'pending' && isSameMessage(cached, message),
      ),
    ) ?? false
  );
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

  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: messageQueries.byChannel(channelId).queryKey,
    }),
    queryClient.invalidateQueries({
      queryKey: messageQueries.repliesPrefix(channelId),
    }),
  ]);
}
