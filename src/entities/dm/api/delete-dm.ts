import { instance } from '@/shared/api/instance';

/** DM을 목록에서 숨긴다. 상대가 새 메시지를 보내면 다시 나타난다. */
export async function deleteDm(channelId: number): Promise<void> {
  await instance.delete(`/chat/chat/dms/${channelId}`);
}
