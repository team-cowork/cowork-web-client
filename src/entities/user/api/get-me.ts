import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type User } from '@/entities/user/model/user';

export async function getMe(): Promise<User> {
  const { data } = await instance.get<ApiResponse<User>>('/user/users/me');

  return data.data;
}
