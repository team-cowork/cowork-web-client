import { type AxiosResponse } from 'axios';

import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type TeamRoleOperation } from '@/entities/team/model/team';

const POLL_INTERVAL_MS = 500;
const POLL_MAX_ATTEMPTS = 20;

type OperationBody = ApiResponse<TeamRoleOperation> | TeamRoleOperation;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function unwrap(body: OperationBody): TeamRoleOperation {
  return 'operationId' in body ? body : body.data;
}

async function getTeamRoleOperation(
  teamId: number,
  operationId: string,
): Promise<TeamRoleOperation> {
  const { data } = await instance.get<OperationBody>(
    `/team/teams/${teamId}/role-operations/${operationId}`,
  );

  return unwrap(data);
}

export async function requestTeamRoleOperation(
  teamId: number,
  send: (headers: {
    'Idempotency-Key': string;
  }) => Promise<AxiosResponse<OperationBody>>,
): Promise<TeamRoleOperation> {
  const { data } = await send({ 'Idempotency-Key': crypto.randomUUID() });
  let operation = unwrap(data);

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
    throw new Error(
      operation.errorMessage ?? '역할 작업을 완료하지 못했습니다',
    );
  }

  return operation;
}
