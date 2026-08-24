import { instance } from '@/shared/api/instance';

export async function deleteTeamMemberRole(
  teamId: number,
  targetUserId: number,
  roleId: number,
): Promise<void> {
  await instance.delete(
    `/teams/${teamId}/members/${targetUserId}/roles/${roleId}`,
  );
}
