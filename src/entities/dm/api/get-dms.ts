import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type DmConversation } from '@/entities/dm/model/dm';

export async function getDms(): Promise<DmConversation[]> {
  const { data } = await instance.get<ApiResponse<DmConversation[]>>('/dms');

  return data.data;
}
