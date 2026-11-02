import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type LiveJoinResponse } from '@/entities/live/model/live';

export async function postLiveJoin(
  channelId: number,
): Promise<LiveJoinResponse> {
  const { data } = await instance.post<ApiResponse<LiveJoinResponse>>(
    `/voice/live/channels/${channelId}/join`,
  );

  return data.data;
}
