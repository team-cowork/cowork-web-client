import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type TeamRolePermissionGroup } from '@/entities/team/model/team';

export async function getTeamRolePermissions(): Promise<
  TeamRolePermissionGroup[]
> {
  const { data } = await instance.get<ApiResponse<TeamRolePermissionGroup[]>>(
    '/preference/preferences/role-permissions',
  );

  return data.data;
}
