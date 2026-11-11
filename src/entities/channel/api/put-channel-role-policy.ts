import { instance } from '@/shared/api/instance';
import { unwrapApiResponse } from '@/shared/api/unwrap';
import { type ApiResponse } from '@/shared/model/api-response';
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

  return unwrapApiResponse(data, 'operationId');
}
