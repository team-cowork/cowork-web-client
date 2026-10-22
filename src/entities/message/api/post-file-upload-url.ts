import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type CreateFileUploadUrlRequest,
  type FileUploadUrl,
} from '@/entities/message/model/message';

export async function postFileUploadUrl(
  channelId: number,
  request: CreateFileUploadUrlRequest,
): Promise<FileUploadUrl> {
  const { data } = await instance.post<ApiResponse<FileUploadUrl>>(
    `/chat/chat/channels/${channelId}/files/presigned-url`,
    request,
  );

  return data.data;
}
