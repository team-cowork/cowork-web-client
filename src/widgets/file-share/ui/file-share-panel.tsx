'use client';

import { useEffect, useRef } from 'react';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { AttachmentCard } from '@/entities/attachment/ui/attachment-card';
import { messageQueries } from '@/entities/message/api/message-queries';
import { type ChannelFile } from '@/entities/message/model/message';
import { useChannelMessageEvents } from '@/entities/message/model/use-channel-message-events';
import { userQueries } from '@/entities/user/api/user-queries';
import { useOpenAttachment } from '@/features/attachment-download/model/use-open-attachment';
import { useDeleteChannelFile } from '@/features/channel-file/model/use-delete-channel-file';
import { useAttachmentUploads } from '@/features/message-attachment/model/use-attachment-uploads';
import { AttachmentDrafts } from '@/features/message-attachment/ui/attachment-drafts';
import { useSendMessage } from '@/features/message-send/model/use-send-message';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/format-date';
import { formatFileSize } from '@/shared/lib/format-file-size';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { FileIcon } from '@/shared/ui/icons/file-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { LoadingPane } from '@/shared/ui/loading-pane';

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

  const { data: me } = useQuery(userQueries.me());
  const files = useInfiniteQuery(messageQueries.channelFiles(channelId));
  const deleteFile = useDeleteChannelFile(channelId);
  const openAttachment = useOpenAttachment();
  const { send } = useSendMessage(channelId);
  const uploads = useAttachmentUploads(channelId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 고른 파일이 모두 올라가면 한 메시지로 묶어 보낸다. 실패한 파일은 목록에 남겨 둔다.
  const { isUploading, confirmedFiles, uploads: drafts } = uploads;
  useEffect(() => {
    if (isUploading || confirmedFiles.length === 0) return;

    send('', confirmedFiles);
    for (const draft of drafts) {
      if (draft.status === 'done') uploads.remove(draft.id);
    }
  }, [isUploading, confirmedFiles, drafts, send, uploads]);

  const open = (file: ChannelFile) =>
    openAttachment({
      channelId,
      messageId: file.messageId,
      attachmentIndex: file.attachmentIndex,
    });

  const list = files.data?.pages.flatMap((page) => page.files) ?? [];

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex shrink-0 items-center justify-between gap-3 px-6 pt-4 pb-3">
        <p className="typography-subtext-medium text-on-surface-variant">
          채널에 올라온 파일을 모아 보여줘요. 누르면 새 탭에서 열립니다.
        </p>
        <Button
          size="S"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? '올리는 중…' : '파일 올리기'}
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
        className="shrink-0 px-6 pb-3"
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        {files.isPending ? (
          <div className="flex h-full items-center justify-center">
            <LoadingPane label="파일을 불러오는 중…" />
          </div>
        ) : files.isError ? (
          <div className="flex h-full items-center justify-center">
            <ErrorState
              title="파일 목록을 불러오지 못했습니다"
              description="잠시 후 다시 시도해 주세요"
              action={
                <Button
                  size="S"
                  variant="weak"
                  onClick={() => void files.refetch()}
                >
                  다시 시도
                </Button>
              }
            />
          </div>
        ) : list.length === 0 ? (
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
                      meta={`${file.uploaderName} · ${formatDate(file.uploadedAt)} · ${formatFileSize(file.fileSize)}`}
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
          </>
        )}
      </div>
    </div>
  );
}
