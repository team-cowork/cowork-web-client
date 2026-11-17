'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { messageQueries } from '@/entities/message/api/message-queries';
import { useOpenAttachment } from '@/features/attachment-download/model/use-open-attachment';
import { ImageViewer } from '@/shared/ui/image-viewer';

export interface ViewerAttachment {
  messageId: string;
  attachmentIndex: number;
  name: string;
}

export interface AttachmentImageViewerProps {
  channelId: number;
  /** 넘겨 볼 이미지 첨부 */
  images: ViewerAttachment[];
  initialIndex: number;
  onClose: () => void;
}

/**
 * 채널의 이미지 첨부를 앱 안에서 크게 본다.
 * 썸네일과 같은 첨부 URL 쿼리를 써서, 이미 받은 주소는 다시 받지 않는다.
 */
export function AttachmentImageViewer({
  channelId,
  images,
  initialIndex,
  onClose,
}: AttachmentImageViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const current = images[index] ?? images[0];
  const openAttachment = useOpenAttachment();

  const { data, isError } = useQuery({
    ...messageQueries.attachmentUrl(
      channelId,
      current?.messageId ?? '',
      current?.attachmentIndex ?? 0,
    ),
    enabled: current !== undefined,
  });

  if (!current) return null;

  return (
    <ImageViewer
      open
      onClose={onClose}
      src={data?.downloadUrl}
      alt={current.name}
      caption={current.name}
      error={isError}
      position={{ index, count: images.length, onChange: setIndex }}
      // 다운로드 주소는 첨부로 내려받도록 발급되므로 새 탭으로 열면 저장된다.
      onDownload={() =>
        openAttachment({
          channelId,
          messageId: current.messageId,
          attachmentIndex: current.attachmentIndex,
        })
      }
    />
  );
}
