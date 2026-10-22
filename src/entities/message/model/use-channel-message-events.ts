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
} from '@/entities/message/model/message';
import {
  applyReaction,
  editMessageContent,
  refetchChannelMessages,
  removeMessage,
  setMessagePinned,
  upsertMessage,
} from '@/entities/message/model/message-cache';
import { userQueries } from '@/entities/user/api/user-queries';
import { getChatSocket } from '@/shared/api/chat-socket';

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
    let hasJoined = false;

    const join = () => {
      socket.emit('join', { channelId });

      // 재연결 때 연결 복구로 놓친 이벤트를 받지 못했다면 목록을 다시 받는다.
      if (hasJoined && !socket.recovered) {
        void refetchChannelMessages(queryClient, channelId);
      }
      hasJoined = true;
    };

    const myId = () => queryClient.getQueryData(userQueries.me().queryKey)?.id;

    const handleMessage = (message: BroadcastMessage) => {
      if (message.channelId !== channelId) return;

      upsertMessage(queryClient, {
        ...message,
        reactions: toReactions(message.reactions, myId()),
      });
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

    socket.on('connect', join);
    socket.on('message', handleMessage);
    socket.on('message:edited', handleEdited);
    socket.on('message:deleted', handleDeleted);
    socket.on('message:pinned', handleMessagePinned);
    socket.on('message:unpinned', handleMessageUnpinned);
    socket.on('message:reaction:added', handleReactionAdded);
    socket.on('message:reaction:removed', handleReactionRemoved);

    if (socket.connected) join();

    return () => {
      socket.off('connect', join);
      socket.off('message', handleMessage);
      socket.off('message:edited', handleEdited);
      socket.off('message:deleted', handleDeleted);
      socket.off('message:pinned', handleMessagePinned);
      socket.off('message:unpinned', handleMessageUnpinned);
      socket.off('message:reaction:added', handleReactionAdded);
      socket.off('message:reaction:removed', handleReactionRemoved);

      if (socket.connected) socket.emit('leave', { channelId });
    };
  }, [channelId, queryClient]);
}
