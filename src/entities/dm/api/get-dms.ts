import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type DmConversation } from '@/entities/dm/model/dm';

export async function getDms(): Promise<DmConversation[]> {
  const { data } =
    await instance.get<ApiResponse<DmConversation[]>>('/chat/chat/dms');

  return data.data;
}
