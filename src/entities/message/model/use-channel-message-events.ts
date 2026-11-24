'use client';

import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  type Message,
  type MessageDeletedEvent,
  type MessageEditedEvent,
  type MessagePinEvent,
  type MessageReaction,
  type MessageReactionEvent,
  type Thread,
  type ThreadRejectedEvent,
} from '@/entities/message/model/message';
import {
  applyReaction,
  editMessageContent,
  refetchChannelMessages,
  removeMessage,
  removeThread,
  setMessagePinned,
  upsertMessage,
  upsertThread,
} from '@/entities/message/model/message-cache';
import {
  notifyMessageStored,
  notifyThreadSettled,
} from '@/entities/message/model/message-delivery';
import { messageQueries } from '@/entities/message/api/message-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { getChatSocket, joinChannelRoom } from '@/shared/api/chat-socket';

// 소켓으로 오는 메시지의 반응은 REST 응답과 달리 반응한 사용자 ID 목록으로 온다.
interface BroadcastReaction {
  emoji: string;
  userIds?: number[];
}

type BroadcastMessage = Omit<Message, 'reactions'> & {
  reactions?: BroadcastReaction[];
};

function toReactions(
  reactions: BroadcastReaction[] = [],
  myId: number | undefined,
): MessageReaction[] {
  return reactions
    .map(({ emoji, userIds = [] }) => ({
      emoji,
      count: userIds.length,
      myReaction: myId !== undefined && userIds.includes(myId),
    }))
    .filter((reaction) => reaction.count > 0);
}

/**
 * 채널 room에 참가해 새 메시지·수정·삭제·고정·반응 이벤트를 메시지 캐시에 반영한다.
 * 채널 화면이 떠 있는 동안 한 곳에서만 호출한다.
 */
export function useChannelMessageEvents(channelId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getChatSocket();
    const leave = joinChannelRoom(channelId);

    // 연결되기 전에 받은 목록이나 끊겨 있던 동안의 메시지는 이벤트로 오지 않는다.
    // 처음 연결될 때와, 연결 복구로 놓친 이벤트를 받지 못한 재연결 때 목록을 다시 받는다.
    const handleConnect = () => {
      if (socket.recovered) return;

      void refetchChannelMessages(queryClient, channelId);
      // 끊겨 있던 동안의 스레드 생성·변경도 이벤트로 오지 않는다.
      void queryClient.invalidateQueries({
        queryKey: messageQueries.threads(channelId).queryKey,
      });
    };

    const myId = () => queryClient.getQueryData(userQueries.me().queryKey)?.id;

    const handleMessage = (message: BroadcastMessage) => {
      if (message.channelId !== channelId) return;

      upsertMessage(queryClient, {
        ...message,
        reactions: toReactions(message.reactions, myId()),
      });

      if (message.attachments.length > 0) {
        void queryClient.invalidateQueries({
          queryKey: messageQueries.channelFiles(channelId).queryKey,
        });
      }

      notifyMessageStored(message.clientMessageId);
    };

    // 수정·삭제 이벤트에는 채널 ID가 없어 이 채널 캐시에서 메시지 ID로 찾는다.
    const handleEdited = ({ messageId, content }: MessageEditedEvent) => {
      editMessageContent(queryClient, channelId, messageId, content);
    };

    const handleDeleted = ({ messageId }: MessageDeletedEvent) => {
      removeMessage(queryClient, channelId, messageId);
    };

    const handlePinned =
      (isPinned: boolean) =>
      ({ messageId, ...event }: MessagePinEvent) => {
        if (event.channelId !== channelId) return;

        void setMessagePinned(queryClient, channelId, messageId, isPinned);
      };
    const handleMessagePinned = handlePinned(true);
    const handleMessageUnpinned = handlePinned(false);

    const handleReaction =
      (added: boolean) =>
      ({ messageId, emoji, userId, count, ...event }: MessageReactionEvent) => {
        if (event.channelId !== channelId) return;

        applyReaction(queryClient, channelId, messageId, {
          emoji,
          count,
          myReaction: userId === myId() ? added : undefined,
        });
      };
    const handleReactionAdded = handleReaction(true);
    const handleReactionRemoved = handleReaction(false);

    const handleThreadCreated = (thread: Thread) => {
      if (thread.channelId !== channelId) return;

      upsertThread(queryClient, thread);
      notifyThreadSettled(thread.parentMessageId, thread);
    };

    const handleThreadUpdated = (thread: Thread) => {
      if (thread.channelId === channelId) upsertThread(queryClient, thread);
    };

    const handleThreadRejected = ({
      id,
      parentMessageId,
      ...event
    }: ThreadRejectedEvent) => {
      if (event.channelId !== channelId) return;

      removeThread(queryClient, channelId, id);
      notifyThreadSettled(parentMessageId, null);
    };

    socket.on('connect', handleConnect);
    socket.on('message', handleMessage);
    socket.on('message:edited', handleEdited);
    socket.on('message:deleted', handleDeleted);
    socket.on('message:pinned', handleMessagePinned);
    socket.on('message:unpinned', handleMessageUnpinned);
    socket.on('message:reaction:added', handleReactionAdded);
    socket.on('message:reaction:removed', handleReactionRemoved);
    socket.on('thread:created', handleThreadCreated);
    socket.on('thread:updated', handleThreadUpdated);
    socket.on('thread:rejected', handleThreadRejected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('message', handleMessage);
      socket.off('message:edited', handleEdited);
      socket.off('message:deleted', handleDeleted);
      socket.off('message:pinned', handleMessagePinned);
      socket.off('message:unpinned', handleMessageUnpinned);
      socket.off('message:reaction:added', handleReactionAdded);
      socket.off('message:reaction:removed', handleReactionRemoved);
      socket.off('thread:created', handleThreadCreated);
      socket.off('thread:updated', handleThreadUpdated);
      socket.off('thread:rejected', handleThreadRejected);

      leave();
    };
  }, [channelId, queryClient]);
}
