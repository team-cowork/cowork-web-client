import { instance } from '@/shared/api/instance';
import { requestTeamRoleOperation } from '@/entities/team/api/request-team-role-operation';

export async function deleteTeamRole(
  teamId: number,
  roleId: number,
): Promise<void> {
  await requestTeamRoleOperation(teamId, (headers) =>
    instance.delete(`/team/teams/${teamId}/roles/${roleId}`, { headers }),
  );
}
