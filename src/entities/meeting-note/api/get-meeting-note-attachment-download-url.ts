import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type AttachmentDownload } from '@/entities/message/model/message';

/** 회의록 첨부를 받을 60초짜리 URL. 저장해 두지 말고 받을 때마다 새로 발급한다. */
export async function getMeetingNoteAttachmentDownloadUrl(
  channelId: number,
  noteId: number,
  objectKey: string,
): Promise<AttachmentDownload> {
  const { data } = await instance.get<ApiResponse<AttachmentDownload>>(
    `/channel/channels/${channelId}/meeting-notes/${noteId}/attachments/download-url`,
    { params: { objectKey } },
  );

  return data.data;
}
