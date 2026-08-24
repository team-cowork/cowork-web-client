import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Channel } from '@/entities/channel/model/channel';

export async function getChannel(channelId: number): Promise<Channel> {
  const { data } = await instance.get<ApiResponse<Channel>>(
    `/channels/${channelId}`,
  );

  return data.data;
}
