import { instance } from '@/shared/api/instance';

export async function postVoiceLeave(channelId: number): Promise<void> {
  await instance.post(`/voice/channels/${channelId}/leave`);
}
