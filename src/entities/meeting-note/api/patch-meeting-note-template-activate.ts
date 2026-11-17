import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type MeetingNoteTemplate } from '@/entities/meeting-note/model/meeting-note';

/** 이 템플릿을 채널의 기본 템플릿으로 정한다. 기존 기본 템플릿은 해제된다. */
export async function patchMeetingNoteTemplateActivate(
  channelId: number,
  templateId: number,
): Promise<MeetingNoteTemplate> {
  const { data } = await instance.patch<ApiResponse<MeetingNoteTemplate>>(
    `/channel/channels/${channelId}/meeting-note-templates/${templateId}/activate`,
  );

  return data.data;
}
