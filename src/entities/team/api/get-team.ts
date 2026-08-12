import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Team } from '@/entities/team/model/team';

export async function getTeam(teamId: number): Promise<Team> {
  const { data } = await instance.get<ApiResponse<Team>>(`/teams/${teamId}`);

  return data.data;
}
