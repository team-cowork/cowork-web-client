'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { type Message } from '@/entities/message/model/message';
import { createMockReplies } from '@/entities/message/model/mock-messages';
import { userQueries } from '@/entities/user/api/user-queries';

interface ReplyThread {
  rootMessageId: number;
  replies: Message[];
}

/**
 * 스레드 답글을 메모리에 유지하는 퍼블리싱 전용 훅.
 * 원본 메시지가 바뀌면 해당 스레드의 답글로 갈아끼운다.
 */
export function useMockReplyThread(rootMessage: Message) {
  const { data: me } = useSuspenseQuery(userQueries.me());
  const [thread, setThread] = useState<ReplyThread>(() => ({
    rootMessageId: rootMessage.id,
    replies: createMockReplies(rootMessage),
  }));

  if (thread.rootMessageId !== rootMessage.id) {
    setThread({
      rootMessageId: rootMessage.id,
      replies: createMockReplies(rootMessage),
    });
  }

  const sendReply = (content: string) => {
    setThread((prev) => ({
      rootMessageId: prev.rootMessageId,
      replies: [
        ...prev.replies,
        {
          id: (prev.replies.at(-1)?.id ?? prev.rootMessageId * 1000) + 1,
          channelId: rootMessage.channelId,
          authorId: me.id,
          authorName: me.nickname ?? me.name,
          authorImageUrl: me.profile_image_url ?? null,
          content,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  };

  return { replies: thread.replies, sendReply };
}
