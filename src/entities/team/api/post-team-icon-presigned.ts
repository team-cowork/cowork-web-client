import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type TeamIconPresignedResponse } from '@/entities/team/model/team';

export async function postTeamIconPresigned(
  contentType: string,
): Promise<TeamIconPresignedResponse> {
  const { data } = await instance.post<ApiResponse<TeamIconPresignedResponse>>(
    '/teams/icon/presigned',
    { contentType },
  );

  return data.data;
}
