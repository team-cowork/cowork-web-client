'use client';

import { useEffect, useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { dmQueries } from '@/entities/dm/api/dm-queries';
import { type DmConversation } from '@/entities/dm/model/dm';
import { messageQueries } from '@/entities/message/api/message-queries';
import { postChannelRead } from '@/entities/message/api/post-channel-read';
import { type ChannelUnread } from '@/entities/message/model/message';

/**
 * 채널을 보고 있는 동안 마지막 메시지까지 읽음으로 기록한다.
 * 탭이 가려져 있으면 기다렸다가 다시 보일 때 기록한다.
 */
export function useMarkChannelRead(
  channelId: number,
  lastMessageId: string | undefined,
) {
  const queryClient = useQueryClient();
  const lastMarkedRef = useRef<string | null>(null);

  const { mutate } = useMutation({
    mutationFn: (messageId: string) => postChannelRead(channelId, messageId),
    onSuccess: () => {
      queryClient.setQueriesData<ChannelUnread[]>(
        { queryKey: [...messageQueries.all(), 'unread'] },
        (unread) =>
          unread?.map((item) =>
            item.channelId === channelId ? { ...item, unreadCount: 0 } : item,
          ),
      );
      queryClient.setQueryData<DmConversation[]>(
        dmQueries.list().queryKey,
        (dms) =>
          dms?.map((dm) =>
            dm.channelId === channelId ? { ...dm, unreadCount: 0 } : dm,
          ),
      );
    },
    onError: () => {
      // 실패하면 다음 기회에 다시 기록하도록 표시를 되돌린다.
      lastMarkedRef.current = null;
    },
  });

  useEffect(() => {
    if (lastMessageId === undefined) return;

    const markRead = () => {
      if (document.visibilityState !== 'visible') return;
      if (lastMarkedRef.current === lastMessageId) return;

      lastMarkedRef.current = lastMessageId;
      mutate(lastMessageId);
    };

    markRead();
    document.addEventListener('visibilitychange', markRead);
    return () => document.removeEventListener('visibilitychange', markRead);
  }, [lastMessageId, mutate]);
}
