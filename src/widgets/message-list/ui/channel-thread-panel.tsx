'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { messageQueries } from '@/entities/message/api/message-queries';
import { type Message } from '@/entities/message/model/message';
import { useAttachmentUploads } from '@/features/message-attachment/model/use-attachment-uploads';
import { AttachmentDrafts } from '@/features/message-attachment/ui/attachment-drafts';
import { useSendMessage } from '@/features/message-send/model/use-send-message';
import { ThreadPanel } from '@/widgets/message-list/ui/thread-panel';

export interface ChannelThreadPanelProps {
  channelId: number;
  subtitle: string;
  rootMessage: Message;
  onClose: () => void;
  className?: string;
}

const UPLOADING_HINT =
  '파일을 올리는 중이에요. 업로드가 끝나면 보낼 수 있어요.';

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
  // 채널 입력창의 첨부와 섞이지 않도록 스레드마다 따로 둔다.
  const attachments = useAttachmentUploads(channelId, `thread:${root._id}`);

  // 서버가 최신순으로 주므로 뒤집어 오래된 순으로 그린다.
  const replies = data && [...data].reverse();

  return (
    <ThreadPanel
      rootMessage={root}
      replies={replies}
      isRepliesError={isError && !data}
      onReloadReplies={() => void refetch()}
      onSendReply={(content) => {
        send(content, attachments.confirmedFiles);
        // 실패한 첨부는 조용히 버리지 않고 이유와 함께 남겨 다시 올리거나 지울 수 있게 한다
        attachments.clearSent();
      }}
      onRetryReply={retry}
      onAttachFiles={attachments.add}
      attachmentDrafts={
        <AttachmentDrafts
          uploads={attachments.uploads}
          onRemove={attachments.remove}
          onRetry={attachments.retry}
        />
      }
      canSendEmpty={attachments.confirmedFiles.length > 0}
      sendDisabled={attachments.isUploading}
      sendDisabledReason={UPLOADING_HINT}
      {...props}
    />
  );
}
