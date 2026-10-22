'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { messageQueries } from '@/entities/message/api/message-queries';
import { type Message } from '@/entities/message/model/message';
import { useSendMessage } from '@/features/message-send/model/use-send-message';
import { ThreadPanel } from '@/widgets/thread-panel/ui/thread-panel';

export interface ChannelThreadPanelProps {
  channelId: number;
  subtitle: string;
  rootMessage: Message;
  onClose: () => void;
  className?: string;
}

/**
 * 원본 메시지의 답글을 불러와 보여주고 답글을 보내는 스레드 패널.
 * 새 답글은 채널 화면의 실시간 구독이 이 패널의 캐시에도 넣어준다.
 */
export function ChannelThreadPanel({
  channelId,
  rootMessage,
  ...props
}: ChannelThreadPanelProps) {
  // 선택할 때 받은 원본은 그 시점 값이라, 채널 캐시에 있으면 수정·반응이 반영된 최신 값을 쓴다.
  const { data: cachedRoot } = useInfiniteQuery({
    ...messageQueries.byChannel(channelId),
    // 채널 화면이 이미 불러온 캐시만 읽는다. 패널을 열 때마다 목록을 다시 받지 않게 한다.
    refetchOnMount: false,
    select: (pages) =>
      pages.pages.flat().find((message) => message._id === rootMessage._id),
  });
  const root = cachedRoot ?? rootMessage;

  const { data, isError, refetch } = useQuery(
    messageQueries.replies(channelId, root._id),
  );
  const { send, retry } = useSendMessage(channelId, root);

  // 서버가 최신순으로 주므로 뒤집어 오래된 순으로 그린다.
  const replies = data && [...data].reverse();

  return (
    <ThreadPanel
      rootMessage={root}
      replies={replies}
      isRepliesError={isError && !data}
      onReloadReplies={() => void refetch()}
      onSendReply={send}
      onRetryReply={retry}
      {...props}
    />
  );
}
