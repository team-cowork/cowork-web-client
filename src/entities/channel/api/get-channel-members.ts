import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ChannelMember } from '@/entities/channel/model/channel';

export async function getChannelMembers(channelId: number): Promise<ChannelMember[]> {
  const { data } = await instance.get<ApiResponse<ChannelMember[]>>(
    `/channels/${channelId}/members`,
  );

  return data.data;
}
