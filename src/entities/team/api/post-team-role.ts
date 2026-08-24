import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type CreateTeamRoleRequest,
  type TeamRole,
} from '@/entities/team/model/team';

export async function postTeamRole(
  teamId: number,
  request: CreateTeamRoleRequest,
): Promise<TeamRole> {
  const { data } = await instance.post<ApiResponse<TeamRole>>(
    `/teams/${teamId}/roles`,
    request,
  );

  return data.data;
}
