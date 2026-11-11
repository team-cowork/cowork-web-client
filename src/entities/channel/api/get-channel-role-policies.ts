import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ChannelRolePolicy } from '@/entities/channel/model/channel';

export async function getChannelRolePolicies(
  channelId: number,
): Promise<ChannelRolePolicy[]> {
  const { data } = await instance.get<ApiResponse<ChannelRolePolicy[]>>(
    `/channel/channels/${channelId}/role-policies`,
  );

  return data.data;
}
