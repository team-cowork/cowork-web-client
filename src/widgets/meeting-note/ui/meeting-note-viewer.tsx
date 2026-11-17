'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { AttachmentCard } from '@/entities/attachment/ui/attachment-card';
import {
  type MeetingNote,
  type MeetingNoteSectionView,
  type MeetingNoteTemplate,
  countAttendees,
  parseMeetingNoteContent,
  splitAttendees,
  toSectionViews,
} from '@/entities/meeting-note/model/meeting-note';
import { userQueries } from '@/entities/user/api/user-queries';
import { userDisplayName } from '@/entities/user/lib/user-display';
import { useOpenMeetingNoteAttachment } from '@/features/attachment-download/model/use-open-meeting-note-attachment';
import { useDeleteMeetingNote } from '@/features/meeting-note-delete/model/use-delete-meeting-note';
import { getHttpErrorMessage } from '@/shared/api/http-error';
import { formatDotDate } from '@/shared/lib/format-date';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { IconButton } from '@/shared/ui/icon-button';
import { EditIcon } from '@/shared/ui/icons/edit-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { Markdown } from '@/shared/ui/markdown';
import { useToast } from '@/shared/ui/toast-provider';

export interface MeetingNoteViewerProps {
  channelId: number;
  note: MeetingNote;
  template: MeetingNoteTemplate | null;
  canEdit: boolean;
  onEdit: () => void;
  onDeleted: () => void;
}

export function MeetingNoteViewer({
  channelId,
  note,
  template,
  canEdit,
  onEdit,
  onDeleted,
}: MeetingNoteViewerProps) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteNote = useDeleteMeetingNote(channelId);
  const openAttachment = useOpenMeetingNoteAttachment();
  const { data: author } = useQuery(userQueries.detail(note.createdBy));
  const authorName = userDisplayName(author, `사용자 #${note.createdBy}`);

  const content = parseMeetingNoteContent(note.content);
  const sections = toSectionViews(content, template?.sections ?? []);
  const attendeeCount = countAttendees(content, template?.sections ?? []);
  // 생성 시각과 수정 시각은 저장 시점에 따로 찍혀 미세하게 다를 수 있다.
  const isEdited =
    new Date(note.updatedAt).getTime() - new Date(note.createdAt).getTime() >
    60_000;

  const handleDelete = () => {
    deleteNote.mutate(note.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        onDeleted();
      },
      onError: (error) =>
        toast(getHttpErrorMessage(error, '회의록을 삭제하지 못했어요')),
    });
  };

  return (
    <article className="min-h-0 min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-7 px-8 pt-10 pb-24">
        <header className="flex flex-col gap-4 pb-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="min-w-0 typography-display-small break-words text-on-surface">
              {note.title}
            </h1>
            {canEdit && (
              <div className="flex shrink-0 gap-1">
                <IconButton
                  aria-label="회의록 수정"
                  title="수정"
                  size="S"
                  variant="clear"
                  onClick={onEdit}
                  className="text-on-surface-variant"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  aria-label="회의록 삭제"
                  title="삭제"
                  size="S"
                  variant="clear"
                  onClick={() => setConfirmOpen(true)}
                  className="text-on-surface-variant hover:text-error"
                >
                  <TrashIcon />
                </IconButton>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-1.5 typography-subtext-medium text-on-surface-variant">
            <Avatar
              src={author?.profile_image_url ?? undefined}
              name={authorName}
              size={22}
              shape="circle"
            />
            <span className="ml-1 typography-label-small text-on-surface">
              {authorName}
            </span>
            <span aria-hidden>·</span>
            <time dateTime={note.createdAt}>
              {formatDotDate(note.createdAt)}
            </time>
            {attendeeCount !== null && (
              <>
                <span aria-hidden>·</span>
                <span>참석 {attendeeCount}명</span>
              </>
            )}
            {isEdited && (
              <>
                <span aria-hidden>·</span>
                <span>{formatDotDate(note.updatedAt)} 수정됨</span>
              </>
            )}
          </div>
        </header>

        {sections.map((section) => (
          <SectionBlock key={section.title} section={section} />
        ))}

        {note.attachments.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="typography-title-small text-on-surface">
              첨부 파일
            </h2>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
              {note.attachments.map((attachment) => (
                <li key={attachment.objectKey}>
                  <button
                    type="button"
                    aria-label={`${attachment.name} 열기`}
                    onClick={() =>
                      openAttachment({
                        channelId,
                        noteId: note.id,
                        objectKey: attachment.objectKey,
                      })
                    }
                    className="w-full cursor-pointer text-left"
                  >
                    <AttachmentCard
                      name={attachment.name}
                      meta="눌러서 열기"
                      className="hover:border-outline"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="회의록을 삭제할까요?"
        description={`"${note.title}" 회의록이 삭제되며, 되돌릴 수 없습니다.`}
      >
        <Button
          variant="weak"
          color="neutral"
          disabled={deleteNote.isPending}
          onClick={() => setConfirmOpen(false)}
        >
          취소
        </Button>
        <Button
          color="danger"
          disabled={deleteNote.isPending}
          onClick={handleDelete}
        >
          {deleteNote.isPending ? '삭제하는 중…' : '삭제'}
        </Button>
      </Dialog>
    </article>
  );
}

function SectionBlock({ section }: { section: MeetingNoteSectionView }) {
  const value = section.value.trim();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="typography-title-small text-on-surface">
        {section.title}
      </h2>
      {!value ? (
        <p className="typography-body-medium text-on-surface-variant/60">
          작성된 내용이 없어요
        </p>
      ) : section.type === 'USER_LIST' ? (
        <ul className="flex flex-wrap gap-1.5">
          {splitAttendees(value).map((name, index) => (
            <li
              key={`${name}-${index}`}
              className="rounded-full bg-surface-variant px-3 py-1 typography-label-small text-on-surface"
            >
              {name}
            </li>
          ))}
        </ul>
      ) : section.type === 'MARKDOWN' ? (
        <Markdown
          variant="document"
          className="typography-body-medium text-on-surface"
        >
          {value}
        </Markdown>
      ) : (
        <p className="typography-body-medium break-words whitespace-pre-wrap text-on-surface">
          {value}
        </p>
      )}
    </section>
  );
}
