'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { messageQueries } from '@/entities/message/api/message-queries';
import { type Message } from '@/entities/message/model/message';
import { useMessageDraft } from '@/features/message-composer/model/use-message-draft';
import { useSendMessage } from '@/features/message-send/model/use-send-message';
import { useCreateThread } from '@/features/thread-create/model/use-create-thread';
import { ThreadPanel } from '@/widgets/message-list/ui/thread-panel';

export interface ChannelThreadPanelProps {
  channelId: number;
  subtitle: string;
  rootMessage: Message;
  onClose: () => void;
  className?: string;
}

/**
 * 원본 메시지의 스레드 메시지를 불러와 보여주고 스레드에 메시지를 보내는 패널.
 * 스레드가 아직 없으면 첫 메시지를 보낼 때 만든다.
 * 새 스레드 메시지는 채널 화면의 실시간 구독이 이 패널의 캐시에도 넣어준다.
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

  const threads = useQuery(messageQueries.threads(channelId));
  const thread = threads.data?.find(
    (candidate) => candidate.parentMessageId === root._id,
  );
  const threadMessages = useQuery({
    ...messageQueries.thread(channelId, thread?.id ?? 0),
    enabled: thread !== undefined,
  });
  const { send, retry } = useSendMessage(channelId);
  const createThread = useCreateThread(channelId);

  const draft = useMessageDraft({
    onSubmit: (content) => {
      if (thread) {
        send(content, [], { threadId: thread.id });
        return;
      }

      createThread.mutate(root, {
        onSuccess: (created) => {
          send(content, [], { threadId: created.id });
          draft.onChange('');
        },
      });
      return false;
    },
  });

  // 서버가 최신순으로 주므로 뒤집어 오래된 순으로 그린다.
  const replies = !threads.data
    ? undefined
    : thread
      ? threadMessages.data && [...threadMessages.data].reverse()
      : [];

  return (
    <ThreadPanel
      rootMessage={root}
      replies={replies}
      isRepliesError={
        (threads.isError && !threads.data) ||
        (threadMessages.isError && !threadMessages.data)
      }
      onReloadReplies={() =>
        void (thread ? threadMessages.refetch() : threads.refetch())
      }
      draft={draft}
      sendDisabled={createThread.isPending}
      sendDisabledReason="스레드를 만드는 중"
      composerNotice={
        createThread.isError
          ? '스레드를 만들지 못했어요. 다시 보내 주세요.'
          : undefined
      }
      onRetryReply={retry}
      {...props}
    />
  );
}
