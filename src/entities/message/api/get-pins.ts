import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Message } from '@/entities/message/model/message';

/** 채널에 고정된 메시지를 최신순으로 최대 100개 내려준다. */
export async function getPins(channelId: number): Promise<Message[]> {
  const { data } = await instance.get<ApiResponse<Message[]>>(
    `/chat/chat/channels/${channelId}/pins`,
  );

  return data.data;
}
