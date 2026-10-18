import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import {
  getMessages,
  MESSAGE_PAGE_SIZE,
} from '@/entities/message/api/get-messages';

// 새 메시지·수정·삭제는 소켓 이벤트로 캐시에 직접 반영한다.
// 포커스 복귀 때 다시 받아오면 전송 중인 메시지가 사라지므로 끈다.
export const messageQueries = {
  all: () => ['message'] as const,
  byChannel: (channelId: number) =>
    infiniteQueryOptions({
      queryKey: [...messageQueries.all(), 'byChannel', channelId],
      queryFn: ({ pageParam }) => getMessages(channelId, { before: pageParam }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length < MESSAGE_PAGE_SIZE
          ? undefined
          : lastPage.findLast((message) => message.sendStatus === undefined)
              ?._id,
      staleTime: 0,
      refetchOnWindowFocus: false,
    }),
  replies: (channelId: number, parentMessageId: string) =>
    queryOptions({
      queryKey: [
        ...messageQueries.all(),
        'replies',
        channelId,
        parentMessageId,
      ],
      queryFn: () => getMessages(channelId, { parentMessageId }),
      staleTime: 0,
      refetchOnWindowFocus: false,
    }),
} as const;
