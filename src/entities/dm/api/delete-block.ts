import { instance } from '@/shared/api/instance';

export async function deleteBlock(targetUserId: number): Promise<void> {
  await instance.delete(`/chat/chat/block/${targetUserId}`);
}
