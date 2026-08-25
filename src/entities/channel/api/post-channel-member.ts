import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type AddChannelMemberRequest,
  type ChannelMember,
} from '@/entities/channel/model/channel';

export async function postChannelMember(
  channelId: number,
  request: AddChannelMemberRequest,
): Promise<ChannelMember> {
  const { data } = await instance.post<ApiResponse<ChannelMember>>(
    `/channels/${channelId}/members`,
    request,
  );

  return data.data;
}
