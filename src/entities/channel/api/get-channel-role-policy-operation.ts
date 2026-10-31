import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ChannelRolePolicyOperation } from '@/entities/channel/model/channel';

export async function getChannelRolePolicyOperation(
  channelId: number,
  roleId: number,
  operationId: string,
): Promise<ChannelRolePolicyOperation> {
  const { data } = await instance.get<ApiResponse<ChannelRolePolicyOperation>>(
    `/channel/channels/${channelId}/role-policies/${roleId}/operations/${operationId}`,
  );

  return data.data;
}
