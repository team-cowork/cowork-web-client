'use client';

import {
  type AttachmentUpload,
  toDraftKey,
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
export function useAttachmentUploads(channelId: number, scope?: string) {
  const key = toDraftKey(channelId, scope);
  const uploads = useAttachmentUploadStore(
    (state) => state.uploadsByDraft[key] ?? NO_UPLOADS,
  );
  const store = useAttachmentUploadStore.getState();

  const ready = uploads.filter((upload) => upload.status === 'done');
  // 원본 파일을 함께 넘겨 서버 미리보기를 받기 전까지 화면에서 바로 그릴 수 있게 한다.
  const confirmedFiles = ready.flatMap((upload) =>
    upload.confirmed
      ? [
          {
            ...upload.confirmed,
            spoiler: upload.spoiler,
            localFile: upload.file,
          },
        ]
      : [],
  );

  return {
    uploads,
    ready,
    confirmedFiles,
    isUploading: uploads.some((upload) => upload.status === 'uploading'),
    isSending: uploads.some((upload) => upload.status === 'sending'),
    add: (files: Iterable<File>) => store.add(key, channelId, files),
    retry: (id: string) => store.retry(key, id),
    remove: (id: string) => store.remove(key, [id]),
    /** 보내기 전에 첨부를 스포일러로 가릴지 켜고 끈다 */
    toggleSpoiler: (id: string) => {
      const upload = uploads.find((item) => item.id === id);
      if (upload) store.update(key, [id], { spoiler: !upload.spoiler });
    },
    /** 보낸 첨부만 지우고, 실패한 첨부는 이유와 함께 남겨 둔다 */
    clearSent: () =>
      store.remove(
        key,
        ready.map((upload) => upload.id),
      ),
    markSendFailed: (ids: string[]) =>
      store.update(key, ids, {
        status: 'failed',
        failedStep: 'send',
        error: '파일을 보내지 못했어요',
      }),
    removeMany: (ids: string[]) => store.remove(key, ids),
    /**
     * 스토어의 최신 상태에서 다 올라간 첨부를 꺼내 "보내는 중"으로 바꾼다.
     * 렌더 시점 값을 쓰지 않으므로 여러 번 불려도 같은 첨부를 두 번 꺼내지 않는다.
     * 아직 올라가는 첨부가 있으면 함께 보내려고 기다린다(빈 결과).
     */
    takeReadyToSend: () => {
      const latest =
        useAttachmentUploadStore.getState().uploadsByDraft[key] ?? NO_UPLOADS;
      if (latest.some((upload) => upload.status === 'uploading')) return null;

      const sendable = latest.filter(
        (upload) => upload.status === 'done' && upload.confirmed,
      );
      if (sendable.length === 0) return null;

      const ids = sendable.map((upload) => upload.id);
      store.update(key, ids, { status: 'sending' });

      return {
        ids,
        // 원본 파일을 함께 넘겨 서버 미리보기를 받기 전까지 화면에서 바로 그릴 수 있게 한다.
        files: sendable.flatMap((upload) =>
          upload.confirmed
            ? [
                {
                  ...upload.confirmed,
                  spoiler: upload.spoiler,
                  localFile: upload.file,
                },
              ]
            : [],
        ),
      };
    },
  };
}
