'use client';

import { useQuery } from '@tanstack/react-query';

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
  const { data, isError, refetch } = useQuery(
    messageQueries.replies(channelId, rootMessage._id),
  );
  const { send, retry } = useSendMessage(channelId, rootMessage);

  // 서버가 최신순으로 주므로 뒤집어 오래된 순으로 그린다.
  const replies = data && [...data].reverse();

  return (
    <ThreadPanel
      rootMessage={rootMessage}
      replies={replies}
      isRepliesError={isError && !data}
      onReloadReplies={() => void refetch()}
      onSendReply={send}
      onRetryReply={retry}
      {...props}
    />
  );
}
