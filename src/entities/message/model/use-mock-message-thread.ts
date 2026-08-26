'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { type Message } from '@/entities/message/model/message';
import { createMockMessages } from '@/entities/message/model/mock-messages';
import { userQueries } from '@/entities/user/api/user-queries';

interface MessageThread {
  channelId: number;
  messages: Message[];
}

/**
 * 메시지 API 연동 전까지 채팅 화면이 동작하도록 목 스레드를 메모리에 유지한다.
 * 전송한 메시지는 새로고침하면 사라지며, API 연동 시 이 훅만 교체하면 된다.
 */
export function useMockMessageThread(channelId: number) {
  const { data: me } = useSuspenseQuery(userQueries.me());
  const [thread, setThread] = useState<MessageThread>(() => ({
    channelId,
    messages: createMockMessages(channelId),
  }));

  if (thread.channelId !== channelId) {
    setThread({ channelId, messages: createMockMessages(channelId) });
  }

  const sendMessage = (content: string) => {
    setThread((prev) => ({
      channelId: prev.channelId,
      messages: [
        ...prev.messages,
        {
          id: (prev.messages.at(-1)?.id ?? 0) + 1,
          channelId: prev.channelId,
          authorId: me.id,
          authorName: me.nickname ?? me.name,
          authorImageUrl: me.profile_image_url ?? null,
          content,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  };

  return { messages: thread.messages, sendMessage };
}
