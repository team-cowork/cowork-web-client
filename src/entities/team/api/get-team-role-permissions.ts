import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type TeamRolePermissionGroup } from '@/entities/team/model/team';

export async function getTeamRolePermissions(): Promise<
  TeamRolePermissionGroup[]
> {
  const { data } = await instance.get<ApiResponse<TeamRolePermissionGroup[]>>(
    '/team/teams/role-permissions',
  );

  return data.data;
}
