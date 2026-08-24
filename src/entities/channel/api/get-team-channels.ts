import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Channel } from '@/entities/channel/model/channel';

export async function getTeamChannels(teamId: number): Promise<Channel[]> {
  const { data } = await instance.get<ApiResponse<Channel[]>>(
    `/teams/${teamId}/channels`,
  );

  return data.data;
}
