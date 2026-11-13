import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  type Channel,
  type UpdateChannelRequest,
} from '@/entities/channel/model/channel';

export async function patchChannel(
  channelId: number,
  request: UpdateChannelRequest,
): Promise<Channel> {
  const { data } = await instance.patch<ApiResponse<Channel>>(
    `/channel/channels/${channelId}`,
    request,
  );

  return data.data;
}
