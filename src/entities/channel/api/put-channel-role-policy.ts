import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ChannelRolePolicyOperation } from '@/entities/channel/model/channel';

export async function putChannelRolePolicy(
  channelId: number,
  roleId: number,
  permissions: Record<string, boolean>,
): Promise<ChannelRolePolicyOperation> {
  const { data } = await instance.put<
    ApiResponse<ChannelRolePolicyOperation> | ChannelRolePolicyOperation
  >(
    `/channel/channels/${channelId}/role-policies/${roleId}`,
    { permissions },
    { headers: { 'Idempotency-Key': crypto.randomUUID() } },
  );

  return 'operationId' in data ? data : data.data;
}
