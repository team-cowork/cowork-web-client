import { isAxiosError } from 'axios';

import { getHttpErrorMessage } from '@/shared/api/http-error';

/**
 * 역할 작업은 요청 단계에서 403 등으로 거절되거나(AxiosError),
 * 비동기 처리 결과로 실패한다(서버 문구를 담은 Error). 두 경우 모두 서버 문구를 보여 준다.
 */
export function roleErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) return getHttpErrorMessage(error, fallback);
  return error instanceof Error && error.message ? error.message : fallback;
}
