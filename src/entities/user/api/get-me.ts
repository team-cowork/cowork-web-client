import { cookies } from 'next/headers';

import { instance } from '@/shared/auth/api/instance';
import { ACCESS_TOKEN_COOKIE, type ApiResponse } from '@/shared/model/token';
import { type User } from '@/entities/user/model/user';

/**
 * 내 정보를 조회한다. 액세스 토큰이 httpOnly 쿠키에 있어 서버에서만 호출할 수 있다.
 * 토큰이 없거나 요청이 실패하면 null을 반환한다.
 */
export async function getMe(): Promise<User | null> {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    const response = await instance.get<ApiResponse<User>>('/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data ?? null;
  } catch {
    return null;
  }
}
