'use client';

import { useMutation } from '@tanstack/react-query';

import { getMeetingNoteAttachmentDownloadUrl } from '@/entities/meeting-note/api/get-meeting-note-attachment-download-url';

interface MeetingNoteAttachmentTarget {
  channelId: number;
  noteId: number;
  objectKey: string;
}

/**
 * 회의록 첨부 파일을 새 탭으로 연다.
 * URL을 받는 동안 기다렸다가 창을 열면 팝업 차단에 걸리므로, 누르는 순간 빈 탭을 먼저 연다.
 */
export function useOpenMeetingNoteAttachment() {
  const { mutate } = useMutation({
    mutationFn: ({
      channelId,
      noteId,
      objectKey,
    }: MeetingNoteAttachmentTarget) =>
      getMeetingNoteAttachmentDownloadUrl(channelId, noteId, objectKey),
  });

  return (target: MeetingNoteAttachmentTarget) => {
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
