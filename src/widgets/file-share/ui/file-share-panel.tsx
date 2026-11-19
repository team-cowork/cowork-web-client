'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { useSuspenseInfiniteQuery, useQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { AttachmentCard } from '@/entities/attachment/ui/attachment-card';
import { messageQueries } from '@/entities/message/api/message-queries';
import { type ChannelFile } from '@/entities/message/model/message';
import { useChannelMessageEvents } from '@/entities/message/model/use-channel-message-events';
import { userQueries } from '@/entities/user/api/user-queries';
import { useOpenAttachment } from '@/features/attachment-download/model/use-open-attachment';
import {
  AttachmentImageViewer,
  type ViewerAttachment,
} from '@/features/attachment-download/ui/attachment-image-viewer';
import { useDeleteChannelFile } from '@/features/channel-file/model/use-delete-channel-file';
import { useMarkLatestRead } from '@/features/channel-read/model/use-mark-latest-read';
import { useAttachmentUploads } from '@/features/message-attachment/model/use-attachment-uploads';
import { AttachmentDrafts } from '@/features/message-attachment/ui/attachment-drafts';
import { useSendMessage } from '@/features/message-send/model/use-send-message';
import { cn } from '@/shared/lib/cn';
import { getPreviewImageType } from '@/shared/lib/file-kind';
import { formatDate } from '@/shared/lib/format-date';
import { formatFileSize } from '@/shared/lib/format-file-size';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { FileIcon } from '@/shared/ui/icons/file-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface FileSharePanelProps {
  channelId: number;
  className?: string;
}

/**
 * 파일 공유 채널의 본문. 올라온 파일을 최신순으로 모아 보여주고,
 * 파일을 올리면 첨부 메시지로 보낸다.
 */
export function FileSharePanel({ channelId, className }: FileSharePanelProps) {
  useChannelMessageEvents(channelId);
  // 파일 말고 다른 메시지가 뒤에 있어도 채널의 가장 최근 메시지까지 읽음 처리한다.
  useMarkLatestRead(channelId);

  const { sendAsync } = useSendMessage(channelId);
  const uploads = useAttachmentUploads(channelId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 고른 파일이 모두 올라가면 한 메시지로 묶어 보낸다. 서버가 실제로 저장해 파일 목록에 뜰 때까지
  // "보내는 중"으로 두었다가 지운다. 실패하면 이유와 함께 남겨 다시 보낼 수 있게 한다.
  const { isUploading, isSending, ready, uploads: drafts } = uploads;
  const sendReady = useEffectEvent(() => {
    const batch = uploads.takeReadyToSend();
    if (!batch) return;

    sendAsync('', batch.files).then(
      () => uploads.removeMany(batch.ids),
      () => uploads.markSendFailed(batch.ids),
    );
  });
  const readyCount = ready.length;
  useEffect(() => {
    if (!isUploading && readyCount > 0) sendReady();
  }, [isUploading, readyCount]);

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex shrink-0 items-center justify-between gap-3 px-6 pt-4 pb-3">
        <p className="typography-subtext-medium text-on-surface-variant">
          채널에 올라온 파일을 모아 보여줘요. 이미지는 바로 보고, 다른 파일은 새
          탭에서 열려요.
        </p>
        <Button
          size="S"
          disabled={isUploading || isSending}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading
            ? '올리는 중…'
            : isSending
              ? '보내는 중…'
              : '파일 올리기'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files?.length) uploads.add(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      <AttachmentDrafts
        uploads={drafts}
        onRemove={uploads.remove}
        onRetry={uploads.retry}
        className="shrink-0 px-6 pb-3"
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        <QueryBoundary
          loadingFallback={
            <div className="flex h-full items-center justify-center">
              <LoadingPane label="파일을 불러오는 중…" />
            </div>
          }
          errorFallback={ChannelFilesError}
          resetKeys={[channelId]}
        >
          <ChannelFilesContent channelId={channelId} />
        </QueryBoundary>
      </div>
    </div>
  );
}

function ChannelFilesContent({
  channelId,
}: Pick<FileSharePanelProps, 'channelId'>) {
  const { data: me } = useQuery(userQueries.me());
  const files = useSuspenseInfiniteQuery(
    messageQueries.channelFiles(channelId),
  );
  const deleteFile = useDeleteChannelFile(channelId);
  const openAttachment = useOpenAttachment();
  // 열 때의 이미지 목록을 고정해, 보는 동안 새 파일이 올라와도 순번이 밀리지 않게 한다.
  const [viewer, setViewer] = useState<{
    images: ViewerAttachment[];
    index: number;
  } | null>(null);

  const list = files.data.pages.flatMap((page) => page.files);

  // 이미지는 불러온 파일 중 이미지끼리 넘겨 보는 뷰어로 열고, 나머지 파일은 새 탭으로 연다.
  const open = (file: ChannelFile) => {
    const imageFiles = list.filter(({ fileName }) =>
      getPreviewImageType(fileName),
    );
    const index = imageFiles.findIndex(({ fileId }) => fileId === file.fileId);
    if (index >= 0) {
      setViewer({
        images: imageFiles.map(({ messageId, attachmentIndex, fileName }) => ({
          messageId,
          attachmentIndex,
          name: fileName,
        })),
        index,
      });
      return;
    }

    openAttachment({
      channelId,
      messageId: file.messageId,
      attachmentIndex: file.attachmentIndex,
    });
  };

  return list.length === 0 ? (
    <div className="flex h-full items-center justify-center">
      <EmptyState
        icon={<FileIcon />}
        title="아직 올라온 파일이 없습니다"
        description="파일 올리기로 첫 파일을 공유해 보세요"
        className="max-w-md"
      />
    </div>
  ) : (
    <>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
        {list.map((file) => (
          <li key={file.fileId} className="relative">
            <button
              type="button"
              aria-label={`${file.fileName} 열기`}
              onClick={() => open(file)}
              className="w-full cursor-pointer text-left"
            >
              <AttachmentCard
                name={file.fileName}
                meta={`${file.spoiler ? '스포일러 · ' : ''}${file.uploaderName} · ${formatDate(file.uploadedAt)} · ${formatFileSize(file.fileSize)}`}
                className="pr-12 hover:border-outline"
              />
            </button>
            {file.uploaderId === me?.id && (
              <button
                type="button"
                aria-label={`${file.fileName} 삭제`}
                disabled={deleteFile.isPending}
                onClick={() => deleteFile.mutate(file)}
                className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-variant hover:text-error disabled:cursor-not-allowed"
              >
                <TrashIcon size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
      {files.hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            size="S"
            variant="weak"
            disabled={files.isFetchingNextPage}
            onClick={() => void files.fetchNextPage()}
          >
            {files.isFetchingNextPage ? '불러오는 중…' : '더 보기'}
          </Button>
        </div>
      )}
      {viewer && (
        <AttachmentImageViewer
          channelId={channelId}
          images={viewer.images}
          initialIndex={viewer.index}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}

function ChannelFilesError({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <ErrorState
        title="파일 목록을 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요"
        action={
          <Button size="S" variant="weak" onClick={resetErrorBoundary}>
            다시 시도
          </Button>
        }
      />
    </div>
  );
}
