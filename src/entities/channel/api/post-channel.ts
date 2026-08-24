import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type Channel,
  type CreateChannelRequest,
} from '@/entities/channel/model/channel';

export async function postChannel(
  request: CreateChannelRequest,
): Promise<Channel> {
  const { data } = await instance.post<ApiResponse<Channel>>(
    '/channels',
    request,
  );

  return data.data;
}
