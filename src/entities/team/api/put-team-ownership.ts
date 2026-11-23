import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  type Team,
  type TransferTeamOwnershipRequest,
} from '@/entities/team/model/team';

export async function putTeamOwnership(
  teamId: number,
  request: TransferTeamOwnershipRequest,
): Promise<Team> {
  const { data } = await instance.put<ApiResponse<Team>>(
    `/team/teams/${teamId}/ownership`,
    request,
  );

  return data.data;
}
