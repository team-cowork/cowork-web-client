import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type TeamSummary } from '@/entities/team/model/team';

export async function getTeams(): Promise<TeamSummary[]> {
  const { data } = await instance.get<ApiResponse<TeamSummary[]>>('/teams');

  return data.data;
}
