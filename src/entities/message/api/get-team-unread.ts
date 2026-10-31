import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ChannelUnread } from '@/entities/message/model/message';

/** 팀에서 내가 속한 채널별 안 읽은 메시지 수 */
export async function getTeamUnread(teamId: number): Promise<ChannelUnread[]> {
  const { data } = await instance.get<ApiResponse<ChannelUnread[]>>(
    `/chat/chat/teams/${teamId}/unread`,
  );

  return data.data;
}
