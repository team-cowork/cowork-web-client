import { instance } from '@/shared/api/instance';

/** 파일이 들어 있는 메시지째로 삭제된다. */
export async function deleteChannelFile(
  channelId: number,
  fileId: string,
): Promise<void> {
  await instance.delete(`/chat/chat/channels/${channelId}/files/${fileId}`);
}
