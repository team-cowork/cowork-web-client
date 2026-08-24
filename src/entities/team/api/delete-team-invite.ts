import { instance } from '@/shared/api/instance';

export async function deleteTeamInvite(
  teamId: number,
  inviteCode: string,
): Promise<void> {
  await instance.delete(`/teams/${teamId}/invites/${inviteCode}`);
}
