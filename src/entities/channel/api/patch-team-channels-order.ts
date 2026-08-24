import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type Channel,
  type ReorderChannelsRequest,
} from '@/entities/channel/model/channel';

export async function patchTeamChannelsOrder(
  teamId: number,
  request: ReorderChannelsRequest,
): Promise<Channel[]> {
  const { data } = await instance.patch<ApiResponse<Channel[]>>(
    `/teams/${teamId}/channels/reorder`,
    request,
  );

  return data.data;
}
