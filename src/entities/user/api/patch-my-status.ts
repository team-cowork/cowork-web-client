import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type UpdateMyStatusRequest,
  type User,
} from '@/entities/user/model/user';

export async function patchMyStatus(
  body: UpdateMyStatusRequest,
): Promise<User> {
  const { data } = await instance.patch<ApiResponse<User>>(
    '/users/me/status',
    body,
  );

  return data.data;
}
