import { instance } from '@/shared/api/instance';

export async function deleteTeamRole(
  teamId: number,
  roleId: number,
): Promise<void> {
  await instance.delete(`/teams/${teamId}/roles/${roleId}`);
}
