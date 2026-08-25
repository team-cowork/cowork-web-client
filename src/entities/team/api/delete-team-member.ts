import { instance } from '@/shared/api/instance';

export async function deleteTeamMember(
  teamId: number,
  targetUserId: number,
): Promise<void> {
  await instance.delete(`/teams/${teamId}/members/${targetUserId}`);
}
