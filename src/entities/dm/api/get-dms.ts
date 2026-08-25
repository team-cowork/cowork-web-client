import { instance } from '@/shared/api/instance';
import { type DmConversation } from '@/entities/dm/model/dm';

export async function getDms(): Promise<DmConversation[]> {
  const { data } = await instance.get<DmConversation[]>('/dms');

  return data;
}
