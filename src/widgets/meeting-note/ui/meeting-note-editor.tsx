'use client';

import {
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { notFound, useRouter } from 'next/navigation';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { AttachmentCard } from '@/entities/attachment/ui/attachment-card';
import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';
import {
  EDITOR_BULLET,
  MEETING_NOTE_CONTENT_MAX_LENGTH,
  MEETING_NOTE_TITLE_MAX_LENGTH,
  type MeetingNote,
  type MeetingNoteAttachment,
  type MeetingNoteContent,
  type MeetingNoteTemplate,
  countAttendees,
  isEditorBulletLine,
  parseMeetingNoteContent,
  pickActiveTemplate,
  type SectionType,
  serializeMeetingNoteContent,
  toEditorBullets,
  toMarkdownBullets,
  toSectionType,
} from '@/entities/meeting-note/model/meeting-note';
import { userQueries } from '@/entities/user/api/user-queries';
import { userDisplayName } from '@/entities/user/lib/user-display';
import { useAttachmentUploads } from '@/features/message-attachment/model/use-attachment-uploads';
import { AttachmentDrafts } from '@/features/message-attachment/ui/attachment-drafts';
import {
  clearMeetingNoteDraft,
  readMeetingNoteDraft,
  writeMeetingNoteDraft,
} from '@/features/meeting-note-write/model/meeting-note-draft';
import { useCreateMeetingNote } from '@/features/meeting-note-write/model/use-create-meeting-note';
import { useUpdateMeetingNote } from '@/features/meeting-note-write/model/use-update-meeting-note';
import { MeetingNotePageHeader } from '@/widgets/meeting-note/ui/meeting-note-page-header';
import { getHttpErrorMessage } from '@/shared/api/http-error';
import { cn } from '@/shared/lib/cn';
import { formatDotDate } from '@/shared/lib/format-date';
import {
  channelPath,
  meetingNoteTemplatesPath,
  meetingNoteViewPath,
} from '@/shared/model/paths';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { CheckIcon } from '@/shared/ui/icons/check-icon';
import { ChevronDownIcon } from '@/shared/ui/icons/chevron-down-icon';
import { FileIcon } from '@/shared/ui/icons/file-icon';
import { PaperclipIcon } from '@/shared/ui/icons/paperclip-icon';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import { Menu, MenuSeparator } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';
import { useToast } from '@/shared/ui/toast-provider';

const DEFAULT_PLACEHOLDER = '내용을 입력하세요...';

interface EditorField {
  title: string;
  type: SectionType;
  placeholder: string;
  isRequired: boolean;
}

/**
 * 템플릿 섹션 순서대로 입력 칸을 만든다.
 * 수정 중이면 템플릿에서 지워진 섹션의 내용도 잃지 않게 끝에 붙인다.
 */
function buildFields(
  template: MeetingNoteTemplate | null,
  orphanSource: MeetingNoteContent,
): EditorField[] {
  const sections = template?.sections ?? [];
  const known = new Set(sections.map((section) => section.title));

  return [
    ...sections.map((section) => ({
      title: section.title,
      type: toSectionType(section.type),
      placeholder: section.placeholder || DEFAULT_PLACEHOLDER,
      isRequired: section.isRequired,
    })),
    ...Object.keys(orphanSource)
      .filter((title) => !known.has(title))
      .map((title) => ({
        title,
        type: 'MARKDOWN' as const,
        placeholder: DEFAULT_PLACEHOLDER,
        isRequired: false,
      })),
  ];
}

/** 저장된 본문을 편집기 표기로 바꾼다. 목록은 글머리 기호로 보여 준다. */
function toEditorValues(content: MeetingNoteContent): MeetingNoteContent {
  return Object.fromEntries(
    Object.entries(content).map(([key, value]) => [
      key,
      toEditorBullets(value),
    ]),
  );
}

function serializeFields(
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

export interface MeetingNoteEditorProps {
  teamId: number;
  channelId: number;
  /** 넘기면 이 회의록을 수정하고, null이면 새로 쓴다. */
  noteId: number | null;
}

export function MeetingNoteEditor({
  teamId,
  channelId,
  noteId,
}: MeetingNoteEditorProps) {
  const { data: templates } = useSuspenseQuery(
    meetingNoteQueries.templates(channelId),
  );
  const { data: notes } = useSuspenseQuery(meetingNoteQueries.list(channelId));
  const { data: me } = useQuery(userQueries.me());

  const note =
    noteId === null ? undefined : notes.find(({ id }) => id === noteId);
  if (noteId !== null && !note) notFound();
  // 남의 회의록은 서버가 수정을 막으므로 편집 화면을 열지 않는다.
  if (note && me && note.createdBy !== me.id) notFound();

  return (
    <MeetingNoteDocument
      key={noteId ?? 'new'}
      teamId={teamId}
      channelId={channelId}
      note={note}
      templates={templates}
    />
  );
}

function MeetingNoteDocument({
  teamId,
  channelId,
  note,
  templates,
}: {
  teamId: number;
  channelId: number;
  note: MeetingNote | undefined;
  templates: MeetingNoteTemplate[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: me } = useQuery(userQueries.me());
  const noteId = note?.id ?? null;

  // 처음 연 순간의 상태. 임시저장본이 있으면 그것부터 이어 쓴다.
  const [initial] = useState(() => {
    const noteContent = note ? parseMeetingNoteContent(note.content) : {};
    const stored = readMeetingNoteDraft(channelId, noteId);
    // 새 회의록 임시저장본은 그 템플릿이 지워졌으면 쓰지 않는다.
    const draft =
      stored && (note || templates.some(({ id }) => id === stored.templateId))
        ? stored
        : null;

    return {
      noteContent,
      draftSavedAt: draft?.savedAt ?? null,
      templateId:
        note?.templateId ??
        draft?.templateId ??
        pickActiveTemplate(templates)?.id ??
        null,
      title: draft?.title ?? note?.title ?? '',
      values: toEditorValues(draft?.content ?? noteContent),
    };
  });

  const [templateId, setTemplateId] = useState(initial.templateId);
  const [title, setTitle] = useState(initial.title);
  const [values, setValues] = useState(initial.values);
  const [keptAttachments, setKeptAttachments] = useState<
    MeetingNoteAttachment[]
  >(note?.attachments ?? []);
  const [submitted, setSubmitted] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploads = useAttachmentUploads(channelId);
  const createNote = useCreateMeetingNote(channelId);
  const updateNote = useUpdateMeetingNote(channelId);
  const isPending = createNote.isPending || updateNote.isPending;

  // 개발 모드에서 effect가 두 번 실행돼도 안내는 한 번만 띄운다.
  const draftNoticeShown = useRef(false);
  useEffect(() => {
    if (!initial.draftSavedAt || draftNoticeShown.current) return;
    draftNoticeShown.current = true;
    toast('임시저장한 내용을 불러왔어요');
  }, [initial.draftSavedAt, toast]);

  const template = templates.find(({ id }) => id === templateId) ?? null;
  const fields = buildFields(template, initial.noteContent);
  const content = serializeFields(fields, values);
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
  const hasFailedUpload = uploads.uploads.some(
    ({ status }) => status === 'failed',
  );

  const isDirty =
    templateId !== initial.templateId ||
    title !== initial.title ||
    fields.some(
      ({ title: key }) => (values[key] ?? '') !== (initial.values[key] ?? ''),
    ) ||
    keptAttachments.length !== (note?.attachments.length ?? 0) ||
    uploads.uploads.length > 0;

  const authorName = userDisplayName(me, '나');
  const writtenAt = note?.createdAt ?? new Date().toISOString();

  const leave = (href: string) => {
    if (isDirty) setLeaveTarget(href);
    else router.push(href);
  };

  const saveDraft = () => {
    if (templateId === null) return false;
    const saved = writeMeetingNoteDraft(channelId, noteId, {
      templateId,
      title,
      content: parseMeetingNoteContent(content),
    });
    toast(
      saved
        ? uploads.uploads.length > 0 ||
          keptAttachments.length !== (note?.attachments.length ?? 0)
          ? '임시저장했어요. 첨부 파일 변경은 게시해야 반영돼요'
          : '임시저장했어요'
        : '이 브라우저에서는 임시저장을 쓸 수 없어요',
    );
    return saved;
  };

  const publish = () => {
    setSubmitted(true);
    if (titleError || missingFields.size > 0) {
      toast('필수 항목을 채워 주세요');
      return;
    }
    if (content.length > MEETING_NOTE_CONTENT_MAX_LENGTH) {
      toast(
        `본문이 너무 길어요. ${MEETING_NOTE_CONTENT_MAX_LENGTH.toLocaleString()}자 이하로 줄여 주세요`,
      );
      return;
    }
    if (hasFailedUpload) {
      toast('올리지 못한 파일을 지운 뒤 다시 시도해 주세요');
      return;
    }

    const attachments = [
      ...keptAttachments,
      ...uploads.confirmedFiles.map(({ objectKey, name }) => ({
        objectKey,
        name,
      })),
    ];
    const onSuccess = (saved: MeetingNote) => {
      clearMeetingNoteDraft(channelId, noteId);
      router.replace(meetingNoteViewPath(teamId, channelId, saved.id));
    };
    const onError = (error: unknown) =>
      toast(getHttpErrorMessage(error, '회의록을 저장하지 못했어요'));

    if (note) {
      updateNote.mutate(
        {
          noteId: note.id,
          request: { title: trimmedTitle, content, attachments },
        },
        { onSuccess, onError },
      );
    } else if (templateId !== null) {
      createNote.mutate(
        { templateId, title: trimmedTitle, content, attachments },
        { onSuccess, onError },
      );
    }
  };

  const backHref = note
    ? meetingNoteViewPath(teamId, channelId, note.id)
    : channelPath(teamId, channelId);

  return (
    <>
      <MeetingNotePageHeader
        title={note ? '회의록 수정' : '회의록 작성'}
        backLabel="회의록 목록으로"
        onBack={() => leave(backHref)}
        actions={
          <>
            <TemplatePicker
              templates={templates}
              selected={template}
              locked={note !== undefined}
              onSelect={setTemplateId}
              onManage={() =>
                leave(meetingNoteTemplatesPath(teamId, channelId))
              }
            />
            <Button
              size="S"
              variant="weak"
              color="neutral"
              disabled={templateId === null}
              onClick={saveDraft}
            >
              임시저장
            </Button>
            <Button
              size="S"
              disabled={isPending || uploads.isUploading || templateId === null}
              onClick={publish}
            >
              {isPending
                ? '저장하는 중…'
                : uploads.isUploading
                  ? '파일 올리는 중…'
                  : note
                    ? '저장'
                    : '게시'}
            </Button>
          </>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {templateId === null ? (
          <p className="mx-auto max-w-[760px] px-8 pt-10 typography-body-medium text-on-surface-variant">
            회의록을 쓰려면 템플릿이 하나 이상 있어야 해요. 오른쪽 위 템플릿
            메뉴에서 템플릿을 만들어 주세요.
          </p>
        ) : (
          <div className="mx-auto flex w-full max-w-[760px] flex-col px-8 pt-10 pb-24">
            <input
              aria-label="회의록 제목"
              value={title}
              maxLength={MEETING_NOTE_TITLE_MAX_LENGTH}
              placeholder="제목 없음"
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={submitted && titleError ? true : undefined}
              className="w-full bg-transparent typography-display-small text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            />
            {submitted && titleError && (
              <p className="mt-1 typography-subtext-small text-error">
                {titleError}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-1.5 typography-subtext-medium text-on-surface-variant">
              <Avatar
                src={me?.profile_image_url ?? undefined}
                name={authorName}
                size={22}
                shape="circle"
              />
              <span className="ml-1 typography-label-small text-on-surface">
                {authorName}
              </span>
              <span aria-hidden>·</span>
              <span>{formatDotDate(writtenAt)}</span>
              {attendeeCount !== null && (
                <>
                  <span aria-hidden>·</span>
                  <span>참석 {attendeeCount}명</span>
                </>
              )}
            </div>

            <div className="mt-10 flex flex-col gap-7">
              {fields.map((field) => (
                <DocumentSection
                  key={field.title}
                  field={field}
                  value={values[field.title] ?? ''}
                  error={submitted && missingFields.has(field.title)}
                  onChange={(value) =>
                    setValues((prev) => ({ ...prev, [field.title]: value }))
                  }
                />
              ))}

              <section className="flex flex-col gap-3">
                <h2 className="typography-title-small text-on-surface">
                  첨부 파일
                </h2>
                {keptAttachments.length > 0 && (
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
                    {keptAttachments.map((attachment) => (
                      <li key={attachment.objectKey}>
                        <AttachmentCard
                          name={attachment.name}
                          onRemove={() =>
                            setKeptAttachments((prev) =>
                              prev.filter(
                                ({ objectKey }) =>
                                  objectKey !== attachment.objectKey,
                              ),
                            )
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}
                <AttachmentDrafts
                  uploads={uploads.uploads}
                  onRemove={uploads.remove}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-fit cursor-pointer items-center gap-1.5 typography-body-medium text-on-surface-variant hover:text-on-surface"
                >
                  <PaperclipIcon size={16} />
                  파일 첨부
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(event) => {
                    if (event.target.files?.length)
                      uploads.add(event.target.files);
                    event.target.value = '';
                  }}
                />
              </section>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={leaveTarget !== null}
        onClose={() => setLeaveTarget(null)}
        title="작성 중인 내용이 있어요"
        description="임시저장하면 이 브라우저에서 나중에 이어 쓸 수 있어요."
      >
        <Button
          variant="weak"
          color="danger"
          onClick={() => {
            if (leaveTarget) router.push(leaveTarget);
            setLeaveTarget(null);
          }}
        >
          저장 안 함
        </Button>
        <Button
          onClick={() => {
            if (saveDraft() && leaveTarget) router.push(leaveTarget);
            setLeaveTarget(null);
          }}
        >
          임시저장하고 나가기
        </Button>
      </Dialog>
    </>
  );
}

function TemplatePicker({
  templates,
  selected,
  locked,
  onSelect,
  onManage,
}: {
  templates: MeetingNoteTemplate[];
  selected: MeetingNoteTemplate | null;
  /** 이미 쓴 회의록은 템플릿을 바꿀 수 없다. */
  locked: boolean;
  onSelect: (templateId: number) => void;
  onManage: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const label = selected ? `${selected.name} 템플릿` : '템플릿 없음';

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title={locked ? '작성한 회의록은 템플릿을 바꿀 수 없어요' : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 max-w-[240px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-surface-container px-3 typography-label-x-small text-on-surface hover:bg-surface-container-high"
      >
        <FileIcon size={14} className="shrink-0 text-on-surface-variant" />
        <span className="truncate">{label}</span>
        <ChevronDownIcon
          size={14}
          className="shrink-0 text-on-surface-variant"
        />
      </button>

      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute top-full right-0 z-50 mt-2"
            onClick={() => setOpen(false)}
          >
            <Menu>
              {templates.map((template) => (
                <MenuItem
                  key={template.id}
                  disabled={locked && template.id !== selected?.id}
                  icon={
                    template.id === selected?.id ? (
                      <CheckIcon size={16} />
                    ) : (
                      <span />
                    )
                  }
                  onClick={() => onSelect(template.id)}
                  className="disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {template.name}
                </MenuItem>
              ))}
              {templates.length > 0 && <MenuSeparator />}
              <MenuItem icon={<SettingsIcon size={16} />} onClick={onManage}>
                템플릿 관리
              </MenuItem>
            </Menu>
          </div>
        </>
      )}
    </div>
  );
}

function DocumentSection({
  field,
  value,
  error,
  onChange,
}: {
  field: EditorField;
  value: string;
  error: boolean;
  onChange: (value: string) => void;
}) {
  const inputClass =
    'w-full bg-transparent typography-body-medium text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none';
  // 날짜 형식이 아닌 기존 값은 날짜 입력기에서 빈칸으로 보이므로 글로 고치게 둔다.
  const isDateInput =
    field.type === 'DATE' && (!value || /^\d{4}-\d{2}-\d{2}$/.test(value));

  return (
    <section className="flex flex-col gap-2">
      <h2 className="typography-title-small text-on-surface">
        {field.title}
        {field.isRequired && (
          <span aria-hidden className="ml-0.5 text-primary">
            *
          </span>
        )}
      </h2>
      {field.type === 'MARKDOWN' ? (
        <BulletTextArea
          aria-label={field.title}
          aria-required={field.isRequired || undefined}
          aria-invalid={error || undefined}
          value={value}
          placeholder={field.placeholder}
          onChange={onChange}
          className={inputClass}
        />
      ) : (
        <input
          aria-label={field.title}
          aria-required={field.isRequired || undefined}
          aria-invalid={error || undefined}
          type={isDateInput ? 'date' : 'text'}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, 'h-7')}
        />
      )}
      {error && (
        <p className="typography-subtext-small text-error">
          필수 항목이에요. 내용을 입력해 주세요
        </p>
      )}
    </section>
  );
}

/**
 * 내용 길이에 맞춰 늘어나는 입력 칸.
 * 줄 맨 앞의 `- `는 글머리 기호로 바꾸고, 목록에서 Enter를 누르면 다음 항목을 이어 준다.
 */
function BulletTextArea({
  value,
  onChange,
  className,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  'aria-label': string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const pendingCursor = useRef<number | null>(null);

  useLayoutEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (pendingCursor.current !== null) {
      textarea.setSelectionRange(pendingCursor.current, pendingCursor.current);
      pendingCursor.current = null;
    }
  }, [value]);

  const replace = (next: string, cursor: number) => {
    pendingCursor.current = cursor;
    onChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 조합 중 Enter는 글자를 확정하는 키라 건드리지 않는다.
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;

    const { selectionStart, selectionEnd } = event.currentTarget;
    if (selectionStart !== selectionEnd) return;

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const line = value.slice(lineStart, selectionStart);
    if (!isEditorBulletLine(line)) return;

    event.preventDefault();
    if (line === EDITOR_BULLET) {
      // 빈 항목에서 Enter를 누르면 목록을 끝낸다.
      replace(
        value.slice(0, lineStart) + value.slice(selectionStart),
        lineStart,
      );
      return;
    }
    const insert = `\n${EDITOR_BULLET}`;
    replace(
      value.slice(0, selectionStart) + insert + value.slice(selectionStart),
      selectionStart + insert.length,
    );
  };

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(event) => onChange(toEditorBullets(event.target.value))}
      onKeyDown={handleKeyDown}
      className={cn('resize-none overflow-hidden leading-[1.9]', className)}
      {...props}
    />
  );
}
