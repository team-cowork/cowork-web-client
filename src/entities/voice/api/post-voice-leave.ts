import { instance } from '@/shared/api/instance';

export async function postVoiceLeave(channelId: number): Promise<void> {
  await instance.post(`/voice/voice/channels/${channelId}/leave`);
}
