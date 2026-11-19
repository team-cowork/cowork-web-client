'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { messageQueries } from '@/entities/message/api/message-queries';
import { useMarkChannelRead } from '@/features/channel-read/model/use-mark-channel-read';

/**
 * 채팅 화면이 없는 채널(음성·파일)에서, 채널의 가장 최근 메시지까지 읽음 처리한다.
 * 새 메시지가 캐시에 들어오면(`useChannelMessageEvents`) 다시 기록한다.
 */
export function useMarkLatestRead(channelId: number) {
  const { data } = useInfiniteQuery(messageQueries.byChannel(channelId));

  // 페이지와 페이지 안의 메시지 모두 최신순이다. 전송 중인 내 메시지는 서버 ID가 없다.
  const latest = data?.pages
    .flat()
    .find((message) => message.sendStatus === undefined);

  useMarkChannelRead(channelId, latest?._id);
}
