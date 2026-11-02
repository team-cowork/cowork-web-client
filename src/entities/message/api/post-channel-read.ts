import { instance } from '@/shared/api/instance';

/** `lastReadMessageId`까지 읽었다고 기록한다. 서버가 남은 미읽 수를 다시 계산한다. */
export async function postChannelRead(
  channelId: number,
  lastReadMessageId: string,
): Promise<void> {
  await instance.post(`/chat/chat/channels/${channelId}/read`, {
    lastReadMessageId,
  });
}
