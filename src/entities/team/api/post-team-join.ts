import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type JoinTeamResult } from '@/entities/team/model/team';

export async function postTeamJoin(
  inviteCode: string,
): Promise<JoinTeamResult> {
  const { data } = await instance.post<ApiResponse<JoinTeamResult>>(
    `/teams/join/${inviteCode}`,
  );

  return data.data;
}
