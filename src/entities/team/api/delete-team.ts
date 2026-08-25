import { instance } from '@/shared/api/instance';

export async function deleteTeam(teamId: number): Promise<void> {
  await instance.delete(`/teams/${teamId}`);
}
