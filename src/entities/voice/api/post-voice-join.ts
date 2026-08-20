import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type VoiceJoinResponse } from '@/entities/voice/model/voice';

export async function postVoiceJoin(channelId: number): Promise<VoiceJoinResponse> {
  const { data } = await instance.post<ApiResponse<VoiceJoinResponse>>(
    `/voice/channels/${channelId}/join`,
  );

  return data.data;
}
