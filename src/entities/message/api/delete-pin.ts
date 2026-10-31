import { instance } from '@/shared/api/instance';

export async function deletePin(
  channelId: number,
  messageId: string,
): Promise<void> {
  await instance.delete(`/chat/chat/channels/${channelId}/pins/${messageId}`);
}
