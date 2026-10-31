import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ChannelFilePage } from '@/entities/message/model/message';

/** 파일 공유(FILE_SHARE) 채널에 올라온 파일을 최신순으로 내려준다. */
export async function getChannelFiles(
  channelId: number,
  before?: string,
): Promise<ChannelFilePage> {
  const { data } = await instance.get<ApiResponse<ChannelFilePage>>(
    `/chat/chat/channels/${channelId}/files`,
    { params: { before } },
  );

  return data.data;
}
