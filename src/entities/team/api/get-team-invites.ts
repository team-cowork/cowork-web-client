import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Invite } from '@/entities/team/model/team';

export async function getTeamInvites(teamId: number): Promise<Invite[]> {
  const { data } = await instance.get<ApiResponse<Invite[]>>(
    `/teams/${teamId}/invites`,
  );

  return data.data;
}
