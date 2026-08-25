import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type InviteMembersRequest,
  type TeamMember,
} from '@/entities/team/model/team';

export async function postTeamMembers(
  teamId: number,
  request: InviteMembersRequest,
): Promise<TeamMember[]> {
  const { data } = await instance.post<ApiResponse<TeamMember[]>>(
    `/teams/${teamId}/members`,
    request,
  );

  return data.data;
}
