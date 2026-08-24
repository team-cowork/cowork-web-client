import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type TeamRole } from '@/entities/team/model/team';

export async function getTeamRoles(teamId: number): Promise<TeamRole[]> {
  const { data } = await instance.get<ApiResponse<TeamRole[]>>(
    `/teams/${teamId}/roles`,
  );

  return data.data;
}
