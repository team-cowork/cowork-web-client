import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type MeetingNoteTemplate } from '@/entities/meeting-note/model/meeting-note';

/** 섹션 없는 빈 템플릿을 만든다. 새 템플릿은 비활성 상태로 만들어진다. */
export async function postMeetingNoteTemplate(
  channelId: number,
  name: string,
): Promise<MeetingNoteTemplate> {
  const { data } = await instance.post<ApiResponse<MeetingNoteTemplate>>(
    `/channel/channels/${channelId}/meeting-note-templates`,
    { name },
  );

  return data.data;
}
