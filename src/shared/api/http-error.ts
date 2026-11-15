import { isAxiosError } from 'axios';

export function getHttpStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function isHttpStatus(error: unknown, status: number): boolean {
  return getHttpStatus(error) === status;
}
