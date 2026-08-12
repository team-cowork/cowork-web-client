import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type CreateTeamRequest, type Team } from '@/entities/team/model/team';

export async function postTeam(request: CreateTeamRequest): Promise<Team> {
  const { data } = await instance.post<ApiResponse<Team>>('/teams', request);

  return data.data;
}
