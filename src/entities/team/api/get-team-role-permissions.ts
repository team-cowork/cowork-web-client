import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  type TeamRolePermissionGroup,
  type TeamRolePermissionsParams,
} from '@/entities/team/model/team';

export async function getTeamRolePermissions(
  params: TeamRolePermissionsParams = {},
): Promise<TeamRolePermissionGroup[]> {
  const { data } = await instance.get<ApiResponse<TeamRolePermissionGroup[]>>(
    '/preference/preferences/role-permissions',
    { params },
  );

  return data.data;
}
