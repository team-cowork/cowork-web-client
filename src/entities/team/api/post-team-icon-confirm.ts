import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type TeamIconConfirmResponse } from '@/entities/team/model/team';

export async function postTeamIconConfirm(
  objectKey: string,
): Promise<TeamIconConfirmResponse> {
  const { data } = await instance.post<ApiResponse<TeamIconConfirmResponse>>(
    '/team/teams/icon/confirm',
    { objectKey },
  );

  return data.data;
}
