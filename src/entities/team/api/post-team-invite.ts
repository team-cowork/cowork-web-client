import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type CreateInviteRequest,
  type Invite,
} from '@/entities/team/model/team';

export async function postTeamInvite(
  teamId: number,
  request: CreateInviteRequest,
): Promise<Invite> {
  const { data } = await instance.post<ApiResponse<Invite>>(
    `/teams/${teamId}/invites`,
    request,
  );

  return data.data;
}
