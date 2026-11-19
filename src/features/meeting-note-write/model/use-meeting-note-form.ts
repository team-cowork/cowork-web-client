'use client';

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';

import {
  buildEditorFields,
  serializeEditorFields,
} from '@/entities/meeting-note/lib/editor-fields';
import {
  clearMeetingNoteDraft,
  isDraftOlderThan,
  type MeetingNoteDraftTarget,
  readMeetingNoteDraft,
  writeMeetingNoteDraft,
} from '@/entities/meeting-note/lib/meeting-note-draft';
import {
  countAttendees,
  type MeetingNote,
  type MeetingNoteContent,
  type MeetingNoteTemplate,
  parseMeetingNoteContent,
} from '@/entities/meeting-note/model/meeting-note';

// 입력이 멈추고 이만큼 지나면 이 브라우저에 자동으로 임시저장한다
const AUTO_SAVE_DELAY_MS = 800;

export interface UseMeetingNoteFormOptions {
  userId: number;
  channelId: number;
  /** 넘기면 이 회의록을 고치고, 없으면 새로 쓴다. */
  note: MeetingNote | undefined;
  templates: MeetingNoteTemplate[];
  /** 첨부처럼 이 폼 밖에서 바뀐 내용이 있는지. 나가기 경고에 함께 쓴다. */
  hasExternalChanges: boolean;
}

/**
 * 회의록 작성·수정 폼의 상태.
 * 임시저장본이 있으면 이어 쓰고, 입력이 바뀌면 자동으로 임시저장하며,
 * 저장하지 않은 내용이 있으면 새로고침·창 닫기 전에 브라우저 확인 창을 띄운다.
 */
export function useMeetingNoteForm({
  userId,
  channelId,
  note,
  templates,
  hasExternalChanges,
}: UseMeetingNoteFormOptions) {
  const noteId = note?.id ?? null;
  const target: MeetingNoteDraftTarget = { userId, channelId, noteId };

  // null이면 템플릿 없이 쓰는 회의록이고, 지워진 템플릿이면 칸이 하나도 없다.
  const sectionsOf = (id: number | null) =>
    id === null
      ? null
      : (templates.find((candidate) => candidate.id === id)?.sections ?? []);

  // 처음 연 순간의 상태. 임시저장본이 있으면 그것부터 이어 쓴다.
  const [initial] = useState(() => {
    const noteContent = note ? parseMeetingNoteContent(note.content) : {};
    const stored = readMeetingNoteDraft(target);
    // 다른 곳에서 회의록이 고쳐진 뒤의 임시저장본은 최신 내용을 덮어쓰므로 쓰지 않는다.
    const isStale =
      !!stored && !!note && isDraftOlderThan(stored, note.updatedAt);
    const draft = stored && !isStale ? stored : null;
    // 새 회의록 임시저장본의 템플릿이 지워졌으면, 버리지 않고 템플릿 없이 이어 쓴다.
    const draftTemplateId =
      draft?.templateId != null &&
      templates.some(({ id }) => id === draft.templateId)
        ? draft.templateId
        : null;
    // 채널에서 기본 템플릿을 정해 두었으면 새 회의록에 쓰고, 없으면 템플릿 없이 시작한다.
    const templateId = note
      ? note.templateId
      : draft
        ? draftTemplateId
        : (templates.find(({ isActive }) => isActive)?.id ?? null);
    const known = new Set(
      buildEditorFields(sectionsOf(templateId), {}).map(({ title }) => title),
    );

    return {
      // 처음 템플릿에 칸이 없는 내용(지워지거나 이름이 바뀐 섹션)은 고아 칸으로 남겨,
      // 템플릿을 바꾸거나 저장해도 말없이 사라지지 않게 한다.
      orphanSource: Object.fromEntries(
        Object.entries(nonEmpty({ ...noteContent, ...draft?.content })).filter(
          ([key]) => !known.has(key),
        ),
      ),
      restoredDraft: draft !== null,
      staleDraft: isStale,
      templateId,
      title: draft?.title ?? note?.title ?? '',
      values: draft?.content ?? noteContent,
    };
  });

  const [templateId, setTemplateId] = useState(initial.templateId);
  const [title, setTitle] = useState(initial.title);
  const [values, setValues] = useState(initial.values);
  // 편집기를 memo로 감싸 다른 칸에 입력할 때 다시 그리지 않도록 참조를 고정한다.
  const setValue = useCallback(
    (key: string, value: string) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );
  // 게시하거나 버린 뒤에는 남은 자동 저장이 임시저장본을 되살리지 않게 막는다.
  const finished = useRef(false);

  const fieldsOf = (id: number | null) =>
    buildEditorFields(sectionsOf(id), initial.orphanSource);
  const template = templates.find(({ id }) => id === templateId) ?? null;
  const fields = fieldsOf(templateId);
  const content = serializeEditorFields(fields, values);
  const attendeeCount = countAttendees(
    parseMeetingNoteContent(content),
    template?.sections ?? [],
  );

  const trimmedTitle = title.trim();
  const titleError = trimmedTitle ? undefined : '제목을 입력해 주세요';
  const missingFields = new Set(
    fields
      .filter((field) => field.isRequired && !values[field.title]?.trim())
      .map((field) => field.title),
  );

  const isFormDirty =
    templateId !== initial.templateId ||
    title !== initial.title ||
    fields.some(
      ({ title: key }) => (values[key] ?? '') !== (initial.values[key] ?? ''),
    );
  const isDirty = isFormDirty || hasExternalChanges;

  const writeDraft = () =>
    writeMeetingNoteDraft(target, {
      templateId,
      title,
      content: parseMeetingNoteContent(content),
    });

  useEffect(() => {
    if (initial.staleDraft) {
      clearMeetingNoteDraft({ userId, channelId, noteId });
    }
  }, [initial.staleDraft, userId, channelId, noteId]);

  const autoSave = useEffectEvent(() => {
    if (!finished.current) writeDraft();
  });

  // 입력이 바뀔 때마다 시간을 다시 잰다
  useEffect(() => {
    if (!isFormDirty) return;

    const timer = setTimeout(autoSave, AUTO_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isFormDirty, templateId, title, content]);

  useEffect(() => {
    if (!isDirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  return {
    templateId,
    template,
    /** 이 템플릿으로 바꾸면 사라지는, 지금 보이고 내용이 있는 칸의 제목들 */
    lostBySwitchingTo: (nextId: number | null) => {
      const next = new Set(fieldsOf(nextId).map(({ title: key }) => key));
      return fields
        .map(({ title: key }) => key)
        .filter((key) => values[key]?.trim() && !next.has(key));
    },
    /** 템플릿을 바꾸고, 새 템플릿에 없는 칸의 내용은 버린다. */
    selectTemplate: (nextId: number | null) => {
      const next = new Set(fieldsOf(nextId).map(({ title: key }) => key));
      setTemplateId(nextId);
      setValues((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([key]) => next.has(key)),
        ),
      );
    },
    title,
    setTitle,
    trimmedTitle,
    values,
    setValue,
    fields,
    content,
    attendeeCount,
    titleError,
    missingFields,
    isDirty,
    /** 임시저장본을 불러와 시작했는지 */
    restoredDraft: initial.restoredDraft,
    /** 지금 내용을 임시저장한다. 저장소를 쓸 수 없으면 false. */
    saveDraft: writeDraft,
    /** 게시했거나 버렸을 때 임시저장본을 지운다. */
    discardDraft: () => {
      finished.current = true;
      clearMeetingNoteDraft(target);
    },
  };
}

function nonEmpty(content: MeetingNoteContent): MeetingNoteContent {
  return Object.fromEntries(
    Object.entries(content).filter(([, value]) => value.trim()),
  );
}
