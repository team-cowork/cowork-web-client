import { instance } from '@/shared/api/instance';

export async function postLiveLeave(channelId: number): Promise<void> {
  await instance.post(`/voice/live/channels/${channelId}/leave`);
}
