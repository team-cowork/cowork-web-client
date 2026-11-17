import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type MeetingNoteTemplate } from '@/entities/meeting-note/model/meeting-note';

/** 템플릿 하나를 섹션과 함께 가져온다. 없으면 서버가 404로 응답한다. */
export async function getMeetingNoteTemplate(
  channelId: number,
  templateId: number,
): Promise<MeetingNoteTemplate> {
  const { data } = await instance.get<ApiResponse<MeetingNoteTemplate>>(
    `/channel/channels/${channelId}/meeting-note-templates/${templateId}`,
  );

  return data.data;
}
