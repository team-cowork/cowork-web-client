import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type AttachmentDownload } from '@/entities/message/model/message';

/** 첨부 파일을 받을 60초짜리 URL. 저장해 두지 말고 받을 때마다 새로 발급한다. */
export async function getAttachmentDownloadUrl(
  channelId: number,
  messageId: string,
  attachmentIndex: number,
): Promise<AttachmentDownload> {
  const { data } = await instance.get<ApiResponse<AttachmentDownload>>(
    `/chat/chat/channels/${channelId}/messages/${messageId}/attachments/${attachmentIndex}/download-url`,
  );

  return data.data;
}
