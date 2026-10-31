'use client';

import { useMutation } from '@tanstack/react-query';

import { getAttachmentDownloadUrl } from '@/entities/message/api/get-attachment-download-url';

interface AttachmentTarget {
  channelId: number;
  messageId: string;
  attachmentIndex: number;
}

/**
 * 첨부 파일을 새 탭으로 연다.
 * URL을 받는 동안 기다렸다가 창을 열면 팝업 차단에 걸리므로, 누르는 순간 빈 탭을 먼저 연다.
 */
export function useOpenAttachment() {
  const { mutate } = useMutation({
    mutationFn: ({ channelId, messageId, attachmentIndex }: AttachmentTarget) =>
      getAttachmentDownloadUrl(channelId, messageId, attachmentIndex),
  });

  return (target: AttachmentTarget) => {
    const tab = window.open('', '_blank');

    mutate(target, {
      onSuccess: ({ downloadUrl }) => {
        if (tab) {
          tab.opener = null;
          tab.location.href = downloadUrl;
        } else {
          window.location.href = downloadUrl;
        }
      },
      onError: () => tab?.close(),
    });
  };
}
