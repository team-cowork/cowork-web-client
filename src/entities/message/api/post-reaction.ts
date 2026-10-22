import { instance } from '@/shared/api/instance';

export async function postReaction(
  channelId: number,
  messageId: string,
  emoji: string,
): Promise<void> {
  await instance.post(
    `/chat/chat/channels/${channelId}/messages/${messageId}/reactions`,
    { emoji },
  );
}
