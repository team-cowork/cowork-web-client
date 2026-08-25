import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Team, type UpdateTeamRequest } from '@/entities/team/model/team';

export async function patchTeam(
  teamId: number,
  request: UpdateTeamRequest,
): Promise<Team> {
  const { data } = await instance.patch<ApiResponse<Team>>(
    `/teams/${teamId}`,
    request,
  );

  return data.data;
}
