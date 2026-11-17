import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type MeetingNoteTemplate } from '@/entities/meeting-note/model/meeting-note';

/** 채널의 회의록 템플릿을 섹션과 함께 가져온다. */
export async function getMeetingNoteTemplates(
  channelId: number,
): Promise<MeetingNoteTemplate[]> {
  const { data } = await instance.get<ApiResponse<MeetingNoteTemplate[]>>(
    `/channel/channels/${channelId}/meeting-note-templates`,
  );

  return data.data;
}
