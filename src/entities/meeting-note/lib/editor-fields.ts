import {
  type MeetingNoteContent,
  type MeetingNoteTemplate,
  type SectionType,
  serializeMeetingNoteContent,
  toSectionType,
} from '@/entities/meeting-note/model/meeting-note';

export const DEFAULT_SECTION_PLACEHOLDER = '내용을 입력하세요...';

/** 편집 화면의 입력 칸 하나 */
export interface EditorField {
  title: string;
  type: SectionType;
  placeholder: string;
  isRequired: boolean;
}

/**
 * 템플릿 섹션 순서대로 입력 칸을 만든다.
 * 템플릿에 없는 키(지워지거나 이름이 바뀐 섹션의 내용)도 잃지 않게 끝에 붙인다.
 */
export function buildEditorFields(
  template: MeetingNoteTemplate | null,
  orphanSource: MeetingNoteContent,
): EditorField[] {
  const sections = template?.sections ?? [];
  const known = new Set(sections.map((section) => section.title));

  return [
    ...sections.map((section) => ({
      title: section.title,
      type: toSectionType(section.type),
      placeholder: section.placeholder || DEFAULT_SECTION_PLACEHOLDER,
      isRequired: section.isRequired,
    })),
    ...Object.keys(orphanSource)
      .filter((title) => !known.has(title))
      .map((title) => ({
        title,
        type: 'MARKDOWN' as const,
        placeholder: DEFAULT_SECTION_PLACEHOLDER,
        isRequired: false,
      })),
  ];
}

export const EDITOR_BULLET = '• ';

/**
 * 본문은 마크다운 목록(`- `)으로 저장하고, 편집기에서는 글머리 기호(`• `)로 보여 준다.
 * 두 표기는 길이가 같지만, 입력 중에 바꾸면 textarea 값이 통째로 바뀌어 커서가 끝으로 간다.
 * 그래서 입력 칸은 바꾼 뒤 커서를 원래 자리로 되돌려야 한다.
 */
export function toEditorBullets(markdown: string): string {
  return markdown.replace(/^- /gm, EDITOR_BULLET);
}

export function toMarkdownBullets(text: string): string {
  return text.replace(/^• /gm, '- ');
}

export function isEditorBulletLine(line: string): boolean {
  return line.startsWith(EDITOR_BULLET);
}

/** 저장된 본문을 편집기 표기로 바꾼다. 목록은 글머리 기호로 보여 준다. */
export function toEditorValues(
  content: MeetingNoteContent,
): MeetingNoteContent {
  return Object.fromEntries(
    Object.entries(content).map(([key, value]) => [
      key,
      toEditorBullets(value),
    ]),
  );
}

/** 입력 칸의 값을 서버에 보낼 본문 JSON으로 바꾼다. */
export function serializeEditorFields(
  fields: EditorField[],
  values: MeetingNoteContent,
): string {
  return serializeMeetingNoteContent(
    Object.fromEntries(
      fields.map((field) => {
        // 목록을 끝내며 남은 빈 줄 같은 끝 공백은 저장하지 않는다.
        const value = (values[field.title] ?? '').trimEnd();
        return [
          field.title,
          field.type === 'MARKDOWN' ? toMarkdownBullets(value) : value,
        ];
      }),
    ),
  );
}
