'use client';

import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  type Message,
  type MessageDeletedEvent,
  type MessageEditedEvent,
} from '@/entities/message/model/message';
import {
  editMessageContent,
  refetchChannelMessages,
  removeMessage,
  upsertMessage,
} from '@/entities/message/model/message-cache';
import { getChatSocket } from '@/shared/api/chat-socket';

/**
 * 채널 room에 참가해 새 메시지·수정·삭제 이벤트를 메시지 캐시에 반영한다.
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

    const handleMessage = (message: Message) => {
      if (message.channelId !== channelId) return;

      upsertMessage(queryClient, message);
    };

    // 수정·삭제 이벤트에는 채널 ID가 없어 이 채널 캐시에서 메시지 ID로 찾는다.
    const handleEdited = ({ messageId, content }: MessageEditedEvent) => {
      editMessageContent(queryClient, channelId, messageId, content);
    };

    const handleDeleted = ({ messageId }: MessageDeletedEvent) => {
      removeMessage(queryClient, channelId, messageId);
    };

    socket.on('connect', join);
    socket.on('message', handleMessage);
    socket.on('message:edited', handleEdited);
    socket.on('message:deleted', handleDeleted);

    if (socket.connected) join();

    return () => {
      socket.off('connect', join);
      socket.off('message', handleMessage);
      socket.off('message:edited', handleEdited);
      socket.off('message:deleted', handleDeleted);

      if (socket.connected) socket.emit('leave', { channelId });
    };
  }, [channelId, queryClient]);
}
