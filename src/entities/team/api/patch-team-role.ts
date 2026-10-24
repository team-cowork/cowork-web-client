import { instance } from '@/shared/api/instance';
import { requestTeamRoleOperation } from '@/entities/team/api/request-team-role-operation';
import {
  type TeamRole,
  type UpdateTeamRoleRequest,
} from '@/entities/team/model/team';

export async function patchTeamRole(
  teamId: number,
  roleId: number,
  request: UpdateTeamRoleRequest,
): Promise<TeamRole> {
  const { role } = await requestTeamRoleOperation(teamId, (headers) =>
    instance.patch(`/team/teams/${teamId}/roles/${roleId}`, request, {
      headers,
    }),
  );
  if (!role) throw new Error('수정된 역할 정보를 받지 못했습니다');

  return role;
}
