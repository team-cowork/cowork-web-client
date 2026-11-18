'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isHttpStatus } from '@/shared/api/http-error';
import { messageQueries } from '@/entities/message/api/message-queries';
import { postThread } from '@/entities/message/api/post-thread';
import { type Message, type Thread } from '@/entities/message/model/message';
import { waitForThread } from '@/entities/message/model/message-delivery';

const CONFIRM_TIMEOUT_MS = 5000;
const THREAD_NAME_MAX_LENGTH = 100;

export function useCreateThread(channelId: number) {
  const queryClient = useQueryClient();

  const findThread = async (parentMessageId: string) => {
    const threads = await queryClient.fetchQuery({
      ...messageQueries.threads(channelId),
      staleTime: 0,
    });
    return threads.find((thread) => thread.parentMessageId === parentMessageId);
  };

  return useMutation({
    mutationFn: async (root: Message): Promise<Thread> => {
      const confirmation = waitForThread(root._id);
      let timer: ReturnType<typeof setTimeout> | undefined;

      try {
        const existing = await postThread(channelId, {
          name:
            root.content.trim().slice(0, THREAD_NAME_MAX_LENGTH) || '스레드',
          parentMessageId: root._id,
        }).then(
          () => undefined,
          (error: unknown) => {
            if (!isHttpStatus(error, 409)) throw error;
            return findThread(root._id);
          },
        );
        if (existing) return existing;

        const timedOut = new Promise<void>((resolve) => {
          timer = setTimeout(resolve, CONFIRM_TIMEOUT_MS);
        });
        const thread = await Promise.race([
          confirmation.settled,
          timedOut.then(() => findThread(root._id)),
        ]);
        if (!thread) throw new Error('스레드를 만들지 못했어요');

        return thread;
      } finally {
        clearTimeout(timer);
        confirmation.cancel();
      }
    },
  });
}
