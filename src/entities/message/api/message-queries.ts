import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getChannelFiles } from '@/entities/message/api/get-channel-files';
import { getPins } from '@/entities/message/api/get-pins';
import { getTeamUnread } from '@/entities/message/api/get-team-unread';
import {
  getMessages,
  MESSAGE_PAGE_SIZE,
} from '@/entities/message/api/get-messages';

const UNREAD_REFETCH_INTERVAL_MS = 30 * 1000;

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
  pins: (channelId: number) =>
    queryOptions({
      queryKey: [...messageQueries.all(), 'pins', channelId],
      queryFn: () => getPins(channelId),
    }),
  channelFiles: (channelId: number) =>
    infiniteQueryOptions({
      queryKey: [...messageQueries.all(), 'files', channelId],
      queryFn: ({ pageParam }) => getChannelFiles(channelId, pageParam),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  // 다른 채널에 새 메시지가 와도 서버가 알려주지 않아 주기적으로 다시 받는다.
  teamUnread: (teamId: number) =>
    queryOptions({
      queryKey: [...messageQueries.all(), 'unread', teamId],
      queryFn: () => getTeamUnread(teamId),
      refetchInterval: UNREAD_REFETCH_INTERVAL_MS,
    }),
} as const;
