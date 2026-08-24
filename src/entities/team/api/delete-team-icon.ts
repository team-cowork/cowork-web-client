import { instance } from '@/shared/api/instance';

export async function deleteTeamIcon(teamId: number): Promise<void> {
  await instance.delete(`/teams/${teamId}/icon`);
}
