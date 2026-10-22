import { instance } from '@/shared/api/instance';

/** 차단한 사용자의 DM 메시지는 더 이상 받지 않는다. */
export async function postBlock(targetUserId: number): Promise<void> {
  await instance.post(`/chat/chat/block/${targetUserId}`);
}
