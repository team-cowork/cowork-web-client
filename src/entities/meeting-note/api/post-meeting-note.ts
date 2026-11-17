import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  normalizeMeetingNote,
  type CreateMeetingNoteRequest,
  type MeetingNote,
} from '@/entities/meeting-note/model/meeting-note';

export async function postMeetingNote(
  channelId: number,
  request: CreateMeetingNoteRequest,
): Promise<MeetingNote> {
  const { data } = await instance.post<ApiResponse<MeetingNote>>(
    `/channel/channels/${channelId}/meeting-notes`,
    request,
  );

  return normalizeMeetingNote(data.data);
}
