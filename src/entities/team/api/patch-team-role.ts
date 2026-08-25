import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type TeamRole,
  type UpdateTeamRoleRequest,
} from '@/entities/team/model/team';

export async function patchTeamRole(
  teamId: number,
  roleId: number,
  request: UpdateTeamRoleRequest,
): Promise<TeamRole> {
  const { data } = await instance.patch<ApiResponse<TeamRole>>(
    `/teams/${teamId}/roles/${roleId}`,
    request,
  );

  return data.data;
}
