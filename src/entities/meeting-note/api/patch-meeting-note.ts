import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  normalizeMeetingNote,
  type MeetingNote,
  type UpdateMeetingNoteRequest,
} from '@/entities/meeting-note/model/meeting-note';

export async function patchMeetingNote(
  channelId: number,
  noteId: number,
  request: UpdateMeetingNoteRequest,
): Promise<MeetingNote> {
  const { data } = await instance.patch<ApiResponse<MeetingNote>>(
    `/channel/channels/${channelId}/meeting-notes/${noteId}`,
    request,
  );

  return normalizeMeetingNote(data.data);
}
