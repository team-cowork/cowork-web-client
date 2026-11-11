import { type ApiResponse } from '@/shared/model/api-response';

export function unwrapApiResponse<T extends object>(
  body: ApiResponse<T> | T,
  rawKey: keyof T,
): T {
  return rawKey in body ? (body as T) : (body as ApiResponse<T>).data;
}
