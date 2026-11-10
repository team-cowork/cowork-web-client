import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type LiveStartResponse } from '@/entities/live/model/live';

export async function postLiveStart(
  channelId: number,
): Promise<LiveStartResponse> {
  const { data } = await instance.post<ApiResponse<LiveStartResponse>>(
    `/voice/live/channels/${channelId}/start`,
  );

  return data.data;
}
