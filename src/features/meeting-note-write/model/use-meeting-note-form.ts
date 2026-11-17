'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

import {
  buildEditorFields,
  serializeEditorFields,
  toEditorValues,
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
  pickActiveTemplate,
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

  // 처음 연 순간의 상태. 임시저장본이 있으면 그것부터 이어 쓴다.
  const [initial] = useState(() => {
    const noteContent = note ? parseMeetingNoteContent(note.content) : {};
    const stored = readMeetingNoteDraft(target);
    // 다른 곳에서 회의록이 고쳐진 뒤의 임시저장본은 최신 내용을 덮어쓰므로 쓰지 않는다.
    const isStale =
      !!stored && !!note && isDraftOlderThan(stored, note.updatedAt);
    // 새 회의록 임시저장본은 그 템플릿이 지워졌으면 쓰지 않는다.
    const templateGone =
      !!stored &&
      !note &&
      !templates.some(({ id }) => id === stored.templateId);
    const draft = stored && !isStale && !templateGone ? stored : null;
    const content: MeetingNoteContent = draft?.content ?? noteContent;

    return {
      // 템플릿에 입력 칸이 없는 키도 잃지 않도록 회의록과 임시저장본의 키를 모두 남긴다.
      orphanSource: { ...noteContent, ...draft?.content },
      restoredDraft: draft !== null,
      staleDraft: isStale,
      templateId:
        note?.templateId ??
        draft?.templateId ??
        pickActiveTemplate(templates)?.id ??
        null,
      title: draft?.title ?? note?.title ?? '',
      values: toEditorValues(content),
    };
  });

  const [templateId, setTemplateId] = useState(initial.templateId);
  const [title, setTitle] = useState(initial.title);
  const [values, setValues] = useState(initial.values);
  // 게시하거나 버린 뒤에는 남은 자동 저장이 임시저장본을 되살리지 않게 막는다.
  const finished = useRef(false);

  const template = templates.find(({ id }) => id === templateId) ?? null;
  const fields = buildEditorFields(template, initial.orphanSource);
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
    templateId !== null &&
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
    if (!isFormDirty || templateId === null) return;

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
    selectTemplate: setTemplateId,
    title,
    setTitle,
    trimmedTitle,
    values,
    setValue: (key: string, value: string) =>
      setValues((prev) => ({ ...prev, [key]: value })),
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
