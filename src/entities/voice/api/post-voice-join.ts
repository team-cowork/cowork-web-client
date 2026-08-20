import { instance } from '@/shared/api/instance';
import { type VoiceJoinResponse } from '@/entities/voice/model/voice';

export async function postVoiceJoin(channelId: number): Promise<VoiceJoinResponse> {
  const { data } = await instance.post<VoiceJoinResponse>(`/voice/channels/${channelId}/join`);

  return data;
}
