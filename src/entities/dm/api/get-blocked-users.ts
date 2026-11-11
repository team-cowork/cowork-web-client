import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';

/** 내가 차단한 사용자 ID 목록 */
export async function getBlockedUsers(): Promise<number[]> {
  const { data } =
    await instance.get<ApiResponse<number[]>>('/chat/chat/block');

  return data.data;
}
