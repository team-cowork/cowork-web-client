import { instance } from '@/shared/api/instance';

export async function deleteTeamGithubInstallation(
  teamId: number,
): Promise<void> {
  await instance.delete(`/team/teams/${teamId}/github-installation`);
}
