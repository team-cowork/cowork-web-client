import { instance } from '@/shared/api/instance';

export async function deleteChannel(channelId: number): Promise<void> {
  await instance.delete(`/channels/${channelId}`);
}
