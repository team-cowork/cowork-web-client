import { type MeetingNoteContent } from '@/entities/meeting-note/model/meeting-note';

/**
 * 임시저장한 회의록. 서버에는 임시저장 상태가 없어 이 브라우저에만 남긴다.
 * 첨부 파일은 업로드 세션이 끝나면 다시 쓸 수 없어 저장하지 않는다.
 */
export interface MeetingNoteDraft {
  templateId: number;
  title: string;
  content: MeetingNoteContent;
  savedAt: string;
}

function draftKey(channelId: number, noteId: number | null): string {
  return `cowork:meeting-note-draft:${channelId}:${noteId ?? 'new'}`;
}

function isDraft(value: unknown): value is MeetingNoteDraft {
  if (value === null || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.templateId === 'number' &&
    typeof draft.title === 'string' &&
    typeof draft.savedAt === 'string' &&
    draft.content !== null &&
    typeof draft.content === 'object'
  );
}

export function readMeetingNoteDraft(
  channelId: number,
  noteId: number | null,
): MeetingNoteDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(channelId, noteId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 저장에 성공하면 true. 저장소를 쓸 수 없는 환경이면 false. */
export function writeMeetingNoteDraft(
  channelId: number,
  noteId: number | null,
  draft: Omit<MeetingNoteDraft, 'savedAt'>,
): boolean {
  try {
    localStorage.setItem(
      draftKey(channelId, noteId),
      JSON.stringify({ ...draft, savedAt: new Date().toISOString() }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearMeetingNoteDraft(
  channelId: number,
  noteId: number | null,
): void {
  try {
    localStorage.removeItem(draftKey(channelId, noteId));
  } catch {
    // 저장소를 쓸 수 없으면 지울 것도 없다.
  }
}
