import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type MeetingNoteTemplate } from '@/entities/meeting-note/model/meeting-note';

export async function patchMeetingNoteTemplate(
  channelId: number,
  templateId: number,
  name: string,
): Promise<MeetingNoteTemplate> {
  const { data } = await instance.patch<ApiResponse<MeetingNoteTemplate>>(
    `/channel/channels/${channelId}/meeting-note-templates/${templateId}`,
    { name },
  );

  return data.data;
}
