import { instance } from '@/shared/api/instance';

export async function deleteChannelMember(
  channelId: number,
  memberId: number,
): Promise<void> {
  await instance.delete(`/channels/${channelId}/members/${memberId}`);
}
