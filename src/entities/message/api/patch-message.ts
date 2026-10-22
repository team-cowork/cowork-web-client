import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type EditMessageRequest,
  type Message,
} from '@/entities/message/model/message';

export async function patchMessage(
  channelId: number,
  messageId: string,
  request: EditMessageRequest,
): Promise<Message> {
  const { data } = await instance.patch<ApiResponse<Message>>(
    `/chat/chat/channels/${channelId}/messages/${messageId}`,
    request,
  );

  return data.data;
}
