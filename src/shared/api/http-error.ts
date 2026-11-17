import { isAxiosError } from 'axios';

export function getHttpStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function isHttpStatus(error: unknown, status: number): boolean {
  return getHttpStatus(error) === status;
}

/** 서버가 내려준 오류 문구. 없으면 fallback을 쓴다. */
export function getHttpErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError<{ message?: unknown }>(error)) return fallback;

  const message = error.response?.data?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
}
