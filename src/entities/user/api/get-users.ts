import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type SearchUsersParams,
  type UserSearchResult,
} from '@/entities/user/model/user';

export async function getUsers(
  params: SearchUsersParams = {},
): Promise<UserSearchResult> {
  const { data } = await instance.get<ApiResponse<UserSearchResult>>(
    '/users/search',
    {
      params,
    },
  );

  return data.data;
}
