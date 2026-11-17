import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  type MeetingNote,
  normalizeMeetingNote,
} from '@/entities/meeting-note/model/meeting-note';

/** 채널의 회의록을 최신순으로 가져온다. 본문까지 함께 온다. */
export async function getMeetingNotes(
  channelId: number,
): Promise<MeetingNote[]> {
  const { data } = await instance.get<ApiResponse<MeetingNote[]>>(
    `/channel/channels/${channelId}/meeting-notes`,
  );

  return data.data.map(normalizeMeetingNote);
}
