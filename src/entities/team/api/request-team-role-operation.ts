import { type AxiosResponse } from 'axios';

import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type TeamRoleOperation } from '@/entities/team/model/team';

const POLL_INTERVAL_MS = 500;
const POLL_MAX_ATTEMPTS = 20;

type OperationBody = ApiResponse<TeamRoleOperation>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getTeamRoleOperation(
  teamId: number,
  operationId: string,
): Promise<TeamRoleOperation> {
  const { data } = await instance.get<OperationBody>(
    `/team/teams/${teamId}/role-operations/${operationId}`,
  );

  return data.data;
}

export async function requestTeamRoleOperation(
  teamId: number,
  send: (headers: {
    'Idempotency-Key': string;
  }) => Promise<AxiosResponse<OperationBody>>,
): Promise<TeamRoleOperation> {
  const { data } = await send({ 'Idempotency-Key': crypto.randomUUID() });
  let operation = data.data;

  for (
    let attempt = 0;
    attempt < POLL_MAX_ATTEMPTS &&
    (operation.status === 'PENDING' || operation.status === 'PROCESSING');
    attempt += 1
  ) {
    await wait(POLL_INTERVAL_MS);
    operation = await getTeamRoleOperation(teamId, operation.operationId);
  }

  if (operation.status !== 'SUCCEEDED') {
    throw new Error(operation.errorMessage ?? '역할 작업을 완료하지 못했어요');
  }

  return operation;
}
