import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type TeamIconPresignedResponse } from '@/entities/team/model/team';

export async function postTeamIconPresigned(
  teamId: number,
  contentType: string,
): Promise<TeamIconPresignedResponse> {
  const { data } = await instance.post<ApiResponse<TeamIconPresignedResponse>>(
    '/team/teams/icon/presigned',
    { teamId, contentType },
  );

  return data.data;
}
