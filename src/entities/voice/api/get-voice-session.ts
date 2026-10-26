import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type VoiceSession } from '@/entities/voice/model/voice';

export async function getVoiceSession(
  sessionId: string,
): Promise<VoiceSession> {
  const { data } = await instance.get<ApiResponse<VoiceSession>>(
    `/voice/voice/sessions/${sessionId}`,
  );

  return data.data;
}
