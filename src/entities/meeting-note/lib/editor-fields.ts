import {
  type MeetingNoteContent,
  type SectionType,
  type TemplateSection,
  serializeMeetingNoteContent,
  toSectionType,
  UNSTRUCTURED_CONTENT_TITLE,
} from '@/entities/meeting-note/model/meeting-note';

export const DEFAULT_SECTION_PLACEHOLDER = '내용을 입력하세요...';

/** 템플릿 없이 쓸 때 본문 칸의 안내 문구 */
export const UNSTRUCTURED_PLACEHOLDER = '내용을 입력하세요';

/** 편집 화면의 입력 칸 하나 */
export interface EditorField {
  title: string;
  type: SectionType;
  placeholder: string;
  isRequired: boolean;
}

/**
 * 템플릿 섹션 순서대로 입력 칸을 만든다.
 * `sections`가 null이면 템플릿 없이 쓰는 회의록이라 본문 칸 하나만 둔다. 템플릿이 지워진 회의록은
 * null이 아니라 빈 배열로 넘겨, 원래 없던 본문 칸이 생기지 않게 한다.
 * 템플릿에 없는 키(지워지거나 이름이 바뀐 섹션의 내용)도 잃지 않게 끝에 붙인다.
 */
export function buildEditorFields(
  sections: TemplateSection[] | null,
  orphanSource: MeetingNoteContent,
): EditorField[] {
  const fromTemplate: EditorField[] = sections
    ? sections.map((section) => ({
        title: section.title,
        type: toSectionType(section.type),
        placeholder: section.placeholder || DEFAULT_SECTION_PLACEHOLDER,
        isRequired: section.isRequired,
      }))
    : [
        {
          title: UNSTRUCTURED_CONTENT_TITLE,
          type: 'MARKDOWN',
          placeholder: UNSTRUCTURED_PLACEHOLDER,
          isRequired: false,
        },
      ];
  const known = new Set(fromTemplate.map((field) => field.title));

  return [
    ...fromTemplate,
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

/** 입력 칸의 값을 서버에 보낼 본문 JSON으로 바꾼다. */
export function serializeEditorFields(
  fields: EditorField[],
  values: MeetingNoteContent,
): string {
  return serializeMeetingNoteContent(
    Object.fromEntries(
      // 끝에 남은 빈 줄 같은 공백은 저장하지 않는다.
      fields.map((field) => [
        field.title,
        (values[field.title] ?? '').trimEnd(),
      ]),
    ),
  );
}
