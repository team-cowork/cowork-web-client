import { instance } from '@/shared/api/instance';

export async function deleteMessage(
  channelId: number,
  messageId: string,
): Promise<void> {
  await instance.delete(
    `/chat/chat/channels/${channelId}/messages/${messageId}`,
  );
}
