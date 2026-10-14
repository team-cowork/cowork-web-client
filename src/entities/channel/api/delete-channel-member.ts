import { instance } from '@/shared/api/instance';

export async function deleteChannelMember(
  channelId: number,
  memberId: number,
): Promise<void> {
  await instance.delete(`/channel/channels/${channelId}/members/${memberId}`);
}
