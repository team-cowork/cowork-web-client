import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type UpdateMeRequest, type User } from '@/entities/user/model/user';

export async function patchMe(body: UpdateMeRequest): Promise<User> {
  const { data } = await instance.patch<ApiResponse<User>>('/users/me', body);

  return data.data;
}
