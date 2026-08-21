import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Channel, type OpenDmRequest } from '@/entities/channel/model/channel';

export async function postDm(request: OpenDmRequest): Promise<Channel> {
  const { data } = await instance.post<ApiResponse<Channel>>('/dms', request);

  return data.data;
}
