import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type TeamMember } from '@/entities/team/model/team';

export async function getTeamMembers(teamId: number): Promise<TeamMember[]> {
  const { data } = await instance.get<ApiResponse<TeamMember[]>>(
    `/teams/${teamId}/members`,
  );

  return data.data;
}
