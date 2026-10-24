import { instance } from '@/shared/api/instance';
import { requestTeamRoleOperation } from '@/entities/team/api/request-team-role-operation';

export async function putTeamMemberRole(
  teamId: number,
  targetUserId: number,
  roleId: number,
): Promise<void> {
  await requestTeamRoleOperation(teamId, (headers) =>
    instance.put(
      `/team/teams/${teamId}/members/${targetUserId}/roles/${roleId}`,
      undefined,
      { headers },
    ),
  );
}
