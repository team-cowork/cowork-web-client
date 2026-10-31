import { instance } from '@/shared/api/instance';

export async function deleteReaction(
  channelId: number,
  messageId: string,
  emoji: string,
): Promise<void> {
  await instance.delete(
    `/chat/chat/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
  );
}
