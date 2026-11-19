export const SECTION_TYPES = [
  'TEXT',
  'MARKDOWN',
  'DATE',
  'DATETIME',
  'USER_LIST',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export function toSectionType(type: string): SectionType {
  return SECTION_TYPES.find((candidate) => candidate === type) ?? 'TEXT';
}

export interface MeetingNoteAttachment {
  objectKey: string;
  name: string;
}

export interface MeetingNote {
  id: number;
  channelId: number;
  /** 템플릿 없이 쓴 회의록이면 null */
  templateId: number | null;
  title: string;
  /** 섹션 제목을 키로 하는 JSON 객체 문자열 */
  content: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  attachments: MeetingNoteAttachment[];
}

export interface TemplateSection {
  id: number;
  templateId: number;
  title: string;
  type: string;
  placeholder: string | null;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingNoteTemplate {
  id: number;
  channelId: number;
  name: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  sections: TemplateSection[];
}

export interface CreateMeetingNoteRequest {
  /** null이면 템플릿 없이 본문 하나로 쓴다. */
  templateId: number | null;
  title: string;
  content: string;
  attachments?: MeetingNoteAttachment[];
}

export interface UpdateMeetingNoteRequest {
  title?: string;
  content?: string;
  /** 생략하면 기존 첨부를 유지하고, 빈 배열이면 모두 해제한다. */
  attachments?: MeetingNoteAttachment[];
}

export interface CreateTemplateSectionRequest {
  title: string;
  type: SectionType;
  placeholder?: string | null;
  isRequired?: boolean;
}

export interface UpdateTemplateSectionRequest {
  title?: string;
  type?: SectionType;
  placeholder?: string | null;
  isRequired?: boolean;
}

export const MEETING_NOTE_TITLE_MAX_LENGTH = 200;
export const TEMPLATE_NAME_MAX_LENGTH = 100;
export const SECTION_TITLE_MAX_LENGTH = 100;
export const MEETING_NOTE_CONTENT_MAX_LENGTH = 100_000;

export type MeetingNoteContent = Record<string, string>;

/** 템플릿 없이 쓴 본문과, 섹션으로 나눌 수 없는 본문을 담아 두는 섹션 제목 */
export const UNSTRUCTURED_CONTENT_TITLE = '본문';

/**
 * 본문 JSON을 섹션 제목 → 문자열 맵으로 바꾼다.
 * 다른 클라이언트가 문자열이 아닌 값을 넣었으면 JSON 문자열로 보여 준다.
 * JSON 객체가 아닌 본문은 버리지 않고 한 섹션에 그대로 담는다. 버리면 화면에서 사라질 뿐 아니라
 * 수정 화면에서 저장할 때 빈 섹션으로 덮어써 원문이 지워진다.
 */
export function parseMeetingNoteContent(content: string): MeetingNoteContent {
  if (!content.trim()) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { [UNSTRUCTURED_CONTENT_TITLE]: content };
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { [UNSTRUCTURED_CONTENT_TITLE]: content };
  }

  return Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    ]),
  );
}

export function serializeMeetingNoteContent(
  content: MeetingNoteContent,
): string {
  return JSON.stringify(content);
}

/** 템플릿 없이 본문 하나만 쓴 회의록인지. 이때는 섹션 제목 없이 문서처럼 보여 준다. */
export function isUnstructuredContent(
  sections: { title: string }[],
  template: MeetingNoteTemplate | null,
): boolean {
  return (
    template === null &&
    sections.length === 1 &&
    sections[0]?.title === UNSTRUCTURED_CONTENT_TITLE
  );
}

export interface MeetingNoteSectionView {
  title: string;
  type: SectionType;
  value: string;
}

/**
 * 템플릿 섹션 순서대로 본문을 늘어놓는다.
 * 템플릿에서 지워진 섹션의 내용도 버리지 않고 뒤에 붙인다.
 */
export function toSectionViews(
  content: MeetingNoteContent,
  sections: TemplateSection[],
): MeetingNoteSectionView[] {
  const known = new Set(sections.map((section) => section.title));
  const fromTemplate = sections.map((section) => ({
    title: section.title,
    type: toSectionType(section.type),
    value: content[section.title] ?? '',
  }));
  const orphaned = Object.entries(content)
    .filter(([title]) => !known.has(title))
    .map(([title, value]) => ({ title, type: 'MARKDOWN' as const, value }));

  return [...fromTemplate, ...orphaned];
}

/** 참석자 칸은 쉼표로 구분한 이름 목록이다. */
export function splitAttendees(value: string): string[] {
  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

/** 참석 인원. 참석자 섹션이 없는 템플릿이면 null. */
export function countAttendees(
  content: MeetingNoteContent,
  sections: TemplateSection[],
): number | null {
  const attendeeSection = sections.find(
    (section) => toSectionType(section.type) === 'USER_LIST',
  );
  if (!attendeeSection) return null;

  return splitAttendees(content[attendeeSection.title] ?? '').length;
}

/**
 * 서버는 시각을 시간대 없이 UTC로 내려 준다(예: 2026-11-17T01:27:42).
 * 그대로 Date에 넣으면 브라우저 시간대로 읽혀 한국에서는 9시간 이르게 보이므로 UTC로 표시해 둔다.
 */
function asUtc(timestamp: string): string {
  if (/(?:Z|[+-]\d{2}:?\d{2})$/.test(timestamp)) return timestamp;
  // 소수점 아래 6자리(마이크로초)는 브라우저에 따라 못 읽으므로 밀리초까지만 남긴다.
  return `${timestamp.replace(/(\.\d{3})\d+$/, '$1')}Z`;
}

export function normalizeMeetingNote(note: MeetingNote): MeetingNote {
  return {
    ...note,
    createdAt: asUtc(note.createdAt),
    updatedAt: asUtc(note.updatedAt),
  };
}
