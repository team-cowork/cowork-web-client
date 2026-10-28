import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type LiveStatus } from '@/entities/live/model/live';

export async function getLiveStatus(channelId: number): Promise<LiveStatus> {
  const { data } = await instance.get<ApiResponse<LiveStatus>>(
    `/voice/live/channels/${channelId}`,
  );

  return data.data;
}
