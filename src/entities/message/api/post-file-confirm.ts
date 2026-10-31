import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ConfirmedFile } from '@/entities/message/model/message';

/** 업로드가 끝난 파일을 서버가 검증하고 메시지에 붙일 최종 key를 돌려준다. */
export async function postFileConfirm(
  channelId: number,
  objectKey: string,
): Promise<ConfirmedFile> {
  const { data } = await instance.post<ApiResponse<ConfirmedFile>>(
    `/chat/chat/channels/${channelId}/files/confirm`,
    { objectKey },
  );

  return data.data;
}
