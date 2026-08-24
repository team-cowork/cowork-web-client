import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type VoiceParticipants } from '@/entities/voice/model/voice';

export async function getVoiceParticipants(
  channelId: number,
): Promise<VoiceParticipants> {
  const { data } = await instance.get<ApiResponse<VoiceParticipants>>(
    `/voice/channels/${channelId}/participants`,
  );

  return data.data;
}
