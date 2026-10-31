'use client';

import { useState } from 'react';

import { uploadChatFile } from '@/entities/message/lib/upload-chat-file';
import { type ConfirmedFile } from '@/entities/message/model/message';
import { createUuid } from '@/shared/lib/create-uuid';

export type AttachmentUploadStatus = 'uploading' | 'done' | 'failed';

export interface AttachmentUpload {
  id: string;
  file: File;
  progress: number;
  status: AttachmentUploadStatus;
  confirmed?: ConfirmedFile;
}

/**
 * 메시지에 붙일 파일을 고르는 즉시 올리고 진행 상태를 관리한다.
 * 업로드가 끝난 파일만 전송에 쓸 수 있다.
 */
export function useAttachmentUploads(channelId: number) {
  const [uploads, setUploads] = useState<AttachmentUpload[]>([]);

  const update = (id: string, patch: Partial<AttachmentUpload>) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id ? { ...upload, ...patch } : upload,
      ),
    );
  };

  const add = (files: Iterable<File>) => {
    const added = Array.from(files, (file) => ({
      id: createUuid(),
      file,
      progress: 0,
      status: 'uploading' as const,
    }));
    setUploads((prev) => [...prev, ...added]);

    for (const { id, file } of added) {
      uploadChatFile(channelId, file, (progress) => update(id, { progress }))
        .then((confirmed) =>
          update(id, { status: 'done', progress: 100, confirmed }),
        )
        .catch(() => update(id, { status: 'failed' }));
    }
  };

  const remove = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  };

  const clear = () => setUploads([]);

  // 원본 파일을 함께 넘겨 서버 미리보기를 받기 전까지 화면에서 바로 그릴 수 있게 한다.
  const confirmedFiles = uploads.flatMap((upload) =>
    upload.confirmed ? [{ ...upload.confirmed, localFile: upload.file }] : [],
  );
  const isUploading = uploads.some((upload) => upload.status === 'uploading');
  const hasFailed = uploads.some((upload) => upload.status === 'failed');

  return {
    uploads,
    confirmedFiles,
    isUploading,
    hasFailed,
    add,
    remove,
    clear,
  };
}
