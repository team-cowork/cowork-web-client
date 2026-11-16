'use client';

import {
  type AttachmentUpload,
  useAttachmentUploadStore,
} from '@/features/message-attachment/model/attachment-upload-store';

export type {
  AttachmentUpload,
  AttachmentUploadStatus,
} from '@/features/message-attachment/model/attachment-upload-store';

const NO_UPLOADS: AttachmentUpload[] = [];

/**
 * 메시지에 붙일 파일을 고르는 즉시 올리고 진행 상태를 관리한다.
 * 업로드가 끝난 파일만 전송에 쓸 수 있고, 화면을 옮겨도 업로드는 이어진다.
 */
export function useAttachmentUploads(channelId: number) {
  const uploads = useAttachmentUploadStore(
    (state) => state.uploadsByChannel[channelId] ?? NO_UPLOADS,
  );
  const store = useAttachmentUploadStore.getState();

  const ready = uploads.filter((upload) => upload.status === 'done');
  // 원본 파일을 함께 넘겨 서버 미리보기를 받기 전까지 화면에서 바로 그릴 수 있게 한다.
  const confirmedFiles = ready.flatMap((upload) =>
    upload.confirmed ? [{ ...upload.confirmed, localFile: upload.file }] : [],
  );

  return {
    uploads,
    ready,
    confirmedFiles,
    isUploading: uploads.some((upload) => upload.status === 'uploading'),
    isSending: uploads.some((upload) => upload.status === 'sending'),
    add: (files: Iterable<File>) => store.add(channelId, files),
    retry: (id: string) => store.retry(channelId, id),
    remove: (id: string) => store.remove(channelId, [id]),
    /** 보낸 첨부만 지우고, 실패한 첨부는 이유와 함께 남겨 둔다 */
    clearSent: () =>
      store.remove(
        channelId,
        ready.map((upload) => upload.id),
      ),
    markSending: (ids: string[]) =>
      store.update(channelId, ids, { status: 'sending' }),
    markSendFailed: (ids: string[]) =>
      store.update(channelId, ids, {
        status: 'failed',
        failedStep: 'send',
        error: '파일을 보내지 못했어요',
      }),
    removeMany: (ids: string[]) => store.remove(channelId, ids),
  };
}
