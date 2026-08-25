import { instance } from '@/shared/api/instance';
import { type ChangeMemberRoleRequest } from '@/entities/team/model/team';

export async function patchTeamMemberRole(
  teamId: number,
  targetUserId: number,
  request: ChangeMemberRoleRequest,
): Promise<void> {
  await instance.patch(
    `/teams/${teamId}/members/${targetUserId}/role`,
    request,
  );
}
