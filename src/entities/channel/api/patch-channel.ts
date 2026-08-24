import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type Channel,
  type UpdateChannelRequest,
} from '@/entities/channel/model/channel';

export async function patchChannel(
  channelId: number,
  request: UpdateChannelRequest,
): Promise<Channel> {
  const { data } = await instance.patch<ApiResponse<Channel>>(
    `/channels/${channelId}`,
    request,
  );

  return data.data;
}
