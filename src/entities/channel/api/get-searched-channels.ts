import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type Channel,
  type SearchChannelsParams,
} from '@/entities/channel/model/channel';

export async function getSearchedChannels(
  params: SearchChannelsParams,
): Promise<Channel[]> {
  const { data } = await instance.get<ApiResponse<Channel[]>>(
    '/search/channels',
    { params },
  );

  return data.data;
}
