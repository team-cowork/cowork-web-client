import { instance } from '@/shared/api/instance';

export async function deleteTeamInvite(
  teamId: number,
  inviteCode: string,
): Promise<void> {
  await instance.delete(`/team/teams/${teamId}/invites/${inviteCode}`);
}
