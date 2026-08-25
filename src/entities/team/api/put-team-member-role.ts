import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type TeamRole } from '@/entities/team/model/team';

export async function putTeamMemberRole(
  teamId: number,
  targetUserId: number,
  roleId: number,
): Promise<TeamRole> {
  const { data } = await instance.put<ApiResponse<TeamRole>>(
    `/teams/${teamId}/members/${targetUserId}/roles/${roleId}`,
  );

  return data.data;
}
