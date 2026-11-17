import { instance } from '@/shared/api/instance';

/** 활성 템플릿이나 회의록이 작성된 템플릿은 서버가 400으로 거절한다. */
export async function deleteMeetingNoteTemplate(
  channelId: number,
  templateId: number,
): Promise<void> {
  await instance.delete(
    `/channel/channels/${channelId}/meeting-note-templates/${templateId}`,
  );
}
