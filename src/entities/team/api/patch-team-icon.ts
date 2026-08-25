import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type TeamIconConfirmResponse,
  type UpdateTeamIconRequest,
} from '@/entities/team/model/team';

export async function patchTeamIcon(
  teamId: number,
  request: UpdateTeamIconRequest,
): Promise<TeamIconConfirmResponse> {
  const { data } = await instance.patch<ApiResponse<TeamIconConfirmResponse>>(
    `/teams/${teamId}/icon`,
    request,
  );

  return data.data;
}
