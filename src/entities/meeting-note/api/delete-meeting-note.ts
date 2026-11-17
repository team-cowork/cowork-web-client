import { instance } from '@/shared/api/instance';

export async function deleteMeetingNote(
  channelId: number,
  noteId: number,
): Promise<void> {
  await instance.delete(
    `/channel/channels/${channelId}/meeting-notes/${noteId}`,
  );
}
