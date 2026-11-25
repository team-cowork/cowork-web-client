import { type MeetingNoteContent } from '@/entities/meeting-note/model/meeting-note';

/**
 * 임시저장한 회의록. 서버에는 임시저장 상태가 없어 이 브라우저에만 남긴다.
 * 첨부 파일은 업로드 세션이 끝나면 다시 쓸 수 없어 저장하지 않는다.
 */
export interface MeetingNoteDraft {
  /** 템플릿 없이 쓰던 중이면 null */
  templateId: number | null;
  title: string;
  content: MeetingNoteContent;
  savedAt: string;
}

/** 어떤 사용자가 어느 회의록을 쓰던 중인지. noteId가 null이면 새 회의록이다. */
export interface MeetingNoteDraftTarget {
  userId: number;
  channelId: number;
  noteId: number | null;
}

// 같은 브라우저에서 계정을 바꿔도 다른 사람의 임시저장본이 열리지 않게 사용자별로 나눈다.
function draftKey({ userId, channelId, noteId }: MeetingNoteDraftTarget) {
  return `cowork:meeting-note-draft:${userId}:${channelId}:${noteId ?? 'new'}`;
}

function isDraft(value: unknown): value is MeetingNoteDraft {
  if (value === null || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  return (
    (typeof draft.templateId === 'number' || draft.templateId === null) &&
    typeof draft.title === 'string' &&
    typeof draft.savedAt === 'string' &&
    draft.content !== null &&
    typeof draft.content === 'object'
  );
}

export function readMeetingNoteDraft(
  target: MeetingNoteDraftTarget,
): MeetingNoteDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(target));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 저장에 성공하면 true. 저장소를 쓸 수 없는 환경이면 false. */
export function writeMeetingNoteDraft(
  target: MeetingNoteDraftTarget,
  draft: Omit<MeetingNoteDraft, 'savedAt'>,
): boolean {
  try {
    localStorage.setItem(
      draftKey(target),
      JSON.stringify({ ...draft, savedAt: new Date().toISOString() }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearMeetingNoteDraft(target: MeetingNoteDraftTarget): void {
  try {
    localStorage.removeItem(draftKey(target));
  } catch {
    // 저장소를 쓸 수 없으면 지울 것도 없다.
  }
}

/** 임시저장한 뒤 회의록이 다른 곳에서 고쳐졌으면 그 임시저장본은 낡은 것이다. */
export function isDraftOlderThan(
  draft: MeetingNoteDraft,
  updatedAt: string,
): boolean {
  return new Date(draft.savedAt).getTime() < new Date(updatedAt).getTime();
}
