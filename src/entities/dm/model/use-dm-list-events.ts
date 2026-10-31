'use client';

import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { dmQueries } from '@/entities/dm/api/dm-queries';
import { getChatSocket, joinChannelRoom } from '@/shared/api/chat-socket';

interface UnreadUpdatedEvent {
  channelId: number;
  unreadCount: number;
}

/**
 * 목록의 DM 채널 room에 모두 참가해, 새 메시지가 오면 미리보기·정렬·미읽 수를 다시 받는다.
 * 서버는 메시지를 채널 room에만 보내므로, 열어 두지 않은 대화의 메시지를 받으려면 room에 들어가 있어야 한다.
 * 목록에 없는 새 대화는 이 방법으로 알 수 없어 `dmQueries.list`의 주기 갱신에 맡긴다.
 */
export function useDmListEvents(channelIds: number[]) {
  const queryClient = useQueryClient();
  // 목록은 마지막 메시지 순으로 자주 바뀌므로, 순서와 상관없이 같은 대화 묶음이면 다시 참가하지 않는다.
  const channelIdsKey = channelIds.toSorted((a, b) => a - b).join(',');

  useEffect(() => {
    if (!channelIdsKey) return;

    const ids = new Set(channelIdsKey.split(',').map(Number));
    const socket = getChatSocket();
    const leaves = [...ids].map(joinChannelRoom);

    const handleMessage = ({ channelId }: { channelId: number }) => {
      if (!ids.has(channelId)) return;

      void queryClient.invalidateQueries({
        queryKey: dmQueries.list().queryKey,
      });
    };

    // 읽음 처리로 바뀐 미읽 수는 서버가 내 user room으로 알려준다.
    const handleUnreadUpdated = ({
      channelId,
      unreadCount,
    }: UnreadUpdatedEvent) => {
      if (!ids.has(channelId)) return;

      queryClient.setQueryData(dmQueries.list().queryKey, (conversations) =>
        conversations?.map((conversation) =>
          conversation.channelId === channelId
            ? { ...conversation, unreadCount }
            : conversation,
        ),
      );
    };

    socket.on('message', handleMessage);
    socket.on('channel:unread:updated', handleUnreadUpdated);

    return () => {
      socket.off('message', handleMessage);
      socket.off('channel:unread:updated', handleUnreadUpdated);
      leaves.forEach((leave) => leave());
    };
  }, [channelIdsKey, queryClient]);
}
