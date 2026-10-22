import { instance } from '@/shared/api/instance';

export async function postPin(
  channelId: number,
  messageId: string,
): Promise<void> {
  await instance.post(`/chat/chat/channels/${channelId}/pins/${messageId}`);
}
