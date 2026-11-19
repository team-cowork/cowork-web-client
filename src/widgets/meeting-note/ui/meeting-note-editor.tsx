'use client';

import { useEffect, useRef, useState } from 'react';

import { notFound, useRouter } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';

import { AttachmentCard } from '@/entities/attachment/ui/attachment-card';
import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';
import { type EditorField } from '@/entities/meeting-note/lib/editor-fields';
import {
  MEETING_NOTE_CONTENT_MAX_LENGTH,
  MEETING_NOTE_TITLE_MAX_LENGTH,
  type MeetingNote,
  type MeetingNoteAttachment,
  type MeetingNoteTemplate,
} from '@/entities/meeting-note/model/meeting-note';
import { userQueries } from '@/entities/user/api/user-queries';
import { userDisplayName } from '@/entities/user/lib/user-display';
import { type User } from '@/entities/user/model/user';
import {
  toDraftKey,
  useAttachmentUploadStore,
} from '@/features/message-attachment/model/attachment-upload-store';
import { useAttachmentUploads } from '@/features/message-attachment/model/use-attachment-uploads';
import { AttachmentDrafts } from '@/features/message-attachment/ui/attachment-drafts';
import { useCreateMeetingNote } from '@/features/meeting-note-write/model/use-create-meeting-note';
import { useMeetingNoteForm } from '@/features/meeting-note-write/model/use-meeting-note-form';
import { useUpdateMeetingNote } from '@/features/meeting-note-write/model/use-update-meeting-note';
import { BulletTextArea } from '@/features/meeting-note-write/ui/bullet-text-area';
import { MeetingNotePageHeader } from '@/widgets/meeting-note/ui/meeting-note-page-header';
import { TemplatePicker } from '@/widgets/meeting-note/ui/template-picker';
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
import { PaperclipIcon } from '@/shared/ui/icons/paperclip-icon';
import { useToast } from '@/shared/ui/toast-provider';

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
  // 작성자 확인과 임시저장 구분에 쓰므로 내 정보를 받은 뒤에 그린다.
  const { data: me } = useSuspenseQuery(userQueries.me());

  const note =
    noteId === null ? undefined : notes.find(({ id }) => id === noteId);
  if (noteId !== null && !note) notFound();
  // 남의 회의록은 서버가 수정을 막으므로 편집 화면을 열지 않는다.
  if (note && note.createdBy !== me.id) notFound();

  return (
    <MeetingNoteDocument
      key={noteId ?? 'new'}
      teamId={teamId}
      channelId={channelId}
      note={note}
      templates={templates}
      me={me}
    />
  );
}

function MeetingNoteDocument({
  teamId,
  channelId,
  note,
  templates,
  me,
}: {
  teamId: number;
  channelId: number;
  note: MeetingNote | undefined;
  templates: MeetingNoteTemplate[];
  me: User;
}) {
  const router = useRouter();
  const { toast } = useToast();

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

  const form = useMeetingNoteForm({
    userId: me.id,
    channelId,
    note,
    templates,
    hasExternalChanges:
      keptAttachments.length !== (note?.attachments.length ?? 0) ||
      uploads.uploads.length > 0,
  });

  // 업로드는 채널별 스토어에 남는다. 편집기를 떠나면(게시·저장 안 함·다른 화면 이동)
  // 이 회의록에 붙이던 파일을 정리해, 다음 회의록에 다시 붙어 나오지 않게 한다.
  useEffect(
    () => () => {
      const store = useAttachmentUploadStore.getState();
      const key = toDraftKey(channelId);
      const ids = (store.uploadsByDraft[key] ?? []).map(({ id }) => id);
      if (ids.length > 0) store.remove(key, ids);
    },
    [channelId],
  );

  // 개발 모드에서 effect가 두 번 실행돼도 안내는 한 번만 띄운다.
  const draftNoticeShown = useRef(false);
  useEffect(() => {
    if (!form.restoredDraft || draftNoticeShown.current) return;
    draftNoticeShown.current = true;
    toast('임시저장한 내용을 불러왔어요');
  }, [form.restoredDraft, toast]);

  const hasFailedUpload = uploads.uploads.some(
    ({ status }) => status === 'failed',
  );
  const authorName = userDisplayName(me, '나');
  const writtenAt = note?.createdAt ?? new Date().toISOString();

  const leave = (href: string) => {
    if (form.isDirty) setLeaveTarget(href);
    else router.push(href);
  };

  const saveDraft = () => {
    const saved = form.saveDraft();
    toast(
      saved
        ? keptAttachments.length !== (note?.attachments.length ?? 0) ||
          uploads.uploads.length > 0
          ? '임시저장했어요. 첨부 파일 변경은 게시해야 반영돼요'
          : '임시저장했어요'
        : '이 브라우저에서는 임시저장을 쓸 수 없어요',
    );
    return saved;
  };

  const publish = () => {
    setSubmitted(true);
    if (form.titleError || form.missingFields.size > 0) {
      toast('필수 항목을 채워 주세요');
      return;
    }
    if (form.content.length > MEETING_NOTE_CONTENT_MAX_LENGTH) {
      toast(
        `본문이 너무 길어요. ${MEETING_NOTE_CONTENT_MAX_LENGTH.toLocaleString()}자 이하로 줄여 주세요`,
      );
      return;
    }
    if (hasFailedUpload) {
      toast('올리지 못한 파일을 다시 올리거나 지운 뒤 다시 시도해 주세요');
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
      form.discardDraft();
      router.replace(meetingNoteViewPath(teamId, channelId, saved.id));
    };
    const onError = (error: unknown) =>
      toast(getHttpErrorMessage(error, '회의록을 저장하지 못했어요'));
    const request = {
      title: form.trimmedTitle,
      content: form.content,
      attachments,
    };

    if (note) {
      updateNote.mutate({ noteId: note.id, request }, { onSuccess, onError });
    } else if (form.templateId !== null) {
      createNote.mutate(
        { templateId: form.templateId, ...request },
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
              selected={form.template}
              locked={note !== undefined}
              onSelect={form.selectTemplate}
              onManage={() =>
                leave(meetingNoteTemplatesPath(teamId, channelId))
              }
            />
            <Button
              size="S"
              variant="weak"
              color="neutral"
              disabled={form.templateId === null}
              onClick={saveDraft}
            >
              임시저장
            </Button>
            <Button
              size="S"
              disabled={
                isPending || uploads.isUploading || form.templateId === null
              }
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
        {form.templateId === null ? (
          <p className="mx-auto max-w-[760px] px-8 pt-10 typography-body-medium text-on-surface-variant">
            회의록을 쓰려면 템플릿이 하나 이상 있어야 해요. 오른쪽 위 템플릿
            메뉴에서 템플릿을 만들어 주세요.
          </p>
        ) : (
          <div className="mx-auto flex w-full max-w-[760px] flex-col px-8 pt-10 pb-24">
            <input
              aria-label="회의록 제목"
              value={form.title}
              maxLength={MEETING_NOTE_TITLE_MAX_LENGTH}
              placeholder="제목 없음"
              onChange={(event) => form.setTitle(event.target.value)}
              aria-invalid={submitted && form.titleError ? true : undefined}
              className="w-full bg-transparent typography-display-small text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            />
            {submitted && form.titleError && (
              <p className="mt-1 typography-subtext-small text-error">
                {form.titleError}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-1.5 typography-subtext-medium text-on-surface-variant">
              <Avatar
                src={me.profile_image_url ?? undefined}
                name={authorName}
                size={22}
                shape="circle"
              />
              <span className="ml-1 typography-label-small text-on-surface">
                {authorName}
              </span>
              <span aria-hidden>·</span>
              <span>{formatDotDate(writtenAt)}</span>
              {form.attendeeCount !== null && (
                <>
                  <span aria-hidden>·</span>
                  <span>참석 {form.attendeeCount}명</span>
                </>
              )}
            </div>

            <div className="mt-10 flex flex-col gap-7">
              {form.fields.map((field) => (
                <DocumentSection
                  key={field.title}
                  field={field}
                  value={form.values[field.title] ?? ''}
                  error={submitted && form.missingFields.has(field.title)}
                  onChange={(value) => form.setValue(field.title, value)}
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
                  onRetry={uploads.retry}
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
            // 자동 임시저장본도 지워야 다음에 열 때 버린 내용이 되살아나지 않는다.
            form.discardDraft();
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
