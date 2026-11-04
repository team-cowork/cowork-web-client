'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { getChannelRolePolicyOperation } from '@/entities/channel/api/get-channel-role-policy-operation';
import { putChannelRolePolicy } from '@/entities/channel/api/put-channel-role-policy';

const POLL_INTERVAL_MS = 500;
const POLL_MAX_ATTEMPTS = 20;

interface SetChannelRolePolicyVariables {
  roleId: number;
  permissions: Record<string, boolean>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function setRolePolicy(
  channelId: number,
  { roleId, permissions }: SetChannelRolePolicyVariables,
) {
  let operation = await putChannelRolePolicy(channelId, roleId, permissions);

  for (
    let attempt = 0;
    attempt < POLL_MAX_ATTEMPTS &&
    (operation.status === 'PENDING' || operation.status === 'PROCESSING');
    attempt += 1
  ) {
    await wait(POLL_INTERVAL_MS);
    operation = await getChannelRolePolicyOperation(
      channelId,
      roleId,
      operation.operationId,
    );
  }

  if (operation.status !== 'SUCCEEDED') {
    throw new Error(
      operation.errorMessage ?? '권한 설정을 완료하지 못했습니다',
    );
  }
}

export function useSetChannelRolePolicy(channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: SetChannelRolePolicyVariables) =>
      setRolePolicy(channelId, variables),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: channelQueries.rolePolicies(channelId).queryKey,
      }),
  });
}
