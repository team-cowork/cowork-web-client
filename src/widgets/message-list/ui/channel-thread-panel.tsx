'use client';

import { useEffect } from 'react';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { messageQueries } from '@/entities/message/api/message-queries';
import { type Message } from '@/entities/message/model/message';
import { clearAttachmentDraft } from '@/features/message-attachment/model/attachment-upload-store';
import { useAttachmentUploads } from '@/features/message-attachment/model/use-attachment-uploads';
import { AttachmentDrafts } from '@/features/message-attachment/ui/attachment-drafts';
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

const UPLOADING_HINT =
  '파일을 올리는 중이에요. 업로드가 끝나면 보낼 수 있어요.';

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
  // 채널 입력창의 첨부와 섞이지 않도록 스레드마다 따로 둔다.
  const attachmentScope = `thread:${root._id}`;
  const attachments = useAttachmentUploads(channelId, attachmentScope);
  const canSendEmpty = attachments.confirmedFiles.length > 0;

  // 입력한 글은 패널을 닫으면 사라지므로, 첨부도 함께 지워 첨부만 남거나 쌓이지 않게 한다.
  useEffect(
    () => () => clearAttachmentDraft(channelId, attachmentScope),
    [channelId, attachmentScope],
  );

  const draft = useMessageDraft({
    allowEmpty: canSendEmpty,
    onSubmit: (content) => {
      // 보낼 첨부를 "보내는 중"으로 바꿔, 스레드를 만드는 사이에 지우거나 바꾸지 못하게 한다.
      // 실패한 첨부는 담지 않고 이유와 함께 남겨 다시 올리거나 지울 수 있게 한다.
      const batch = attachments.takeReadyToSend();
      const files = batch?.files ?? [];
      const ids = batch?.ids ?? [];

      if (thread) {
        send(content, files, { threadId: thread.id });
        attachments.removeMany(ids);
        return;
      }

      // `mutate`에 넘긴 콜백은 패널이 닫히면 불리지 않아, 스레드를 만드는 중에 패널을 닫으면
      // 첫 메시지가 사라진다. Promise로 이어 가면 닫혀도 메시지를 보낸다.
      createThread.mutateAsync(root).then(
        (created) => {
          send(content, files, { threadId: created.id });
          attachments.removeMany(ids);
          // 만드는 동안 더 입력한 내용은 지우지 않는다.
          draft.onChange((current) =>
            current.trim() === content ? '' : current,
          );
        },
        // 스레드를 만들지 못하면 입력과 첨부를 남겨 다시 보낼 수 있게 한다.
        () => attachments.restoreReady(ids),
      );
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
      sendDisabled={createThread.isPending || attachments.isUploading}
      sendDisabledReason={
        createThread.isPending ? '스레드를 만드는 중' : UPLOADING_HINT
      }
      composerNotice={
        createThread.isError
          ? '스레드를 만들지 못했어요. 다시 보내 주세요.'
          : undefined
      }
      onRetryReply={retry}
      onAttachFiles={attachments.add}
      attachmentDrafts={
        <AttachmentDrafts
          uploads={attachments.uploads}
          onRemove={attachments.remove}
          onRetry={attachments.retry}
          onToggleSpoiler={attachments.toggleSpoiler}
        />
      }
      canSendEmpty={canSendEmpty}
      {...props}
    />
  );
}
