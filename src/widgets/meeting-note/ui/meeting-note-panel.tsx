'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';
import { type MeetingNote } from '@/entities/meeting-note/model/meeting-note';
import { userQueries } from '@/entities/user/api/user-queries';
import { userDisplayName } from '@/entities/user/lib/user-display';
import { MeetingNoteViewer } from '@/widgets/meeting-note/ui/meeting-note-viewer';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/format-date';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import {
  channelPath,
  meetingNoteEditPath,
  meetingNoteNewPath,
  meetingNoteTemplatesPath,
  meetingNoteViewPath,
} from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { IconButton } from '@/shared/ui/icon-button';
import { EditIcon } from '@/shared/ui/icons/edit-icon';
import { PaperclipIcon } from '@/shared/ui/icons/paperclip-icon';
import { PlusIcon } from '@/shared/ui/icons/plus-icon';
import { SearchIcon } from '@/shared/ui/icons/search-icon';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface MeetingNotePanelProps {
  teamId: number;
  channelId: number;
  className?: string;
}

/**
 * 회의록 채널의 본문. 왼쪽에 회의록 목록을, 오른쪽에 고른 회의록을 보여 준다.
 * 고른 회의록은 주소의 `?note=`로 남겨 새로고침하거나 공유해도 같은 회의록이 열린다.
 */
export function MeetingNotePanel({
  teamId,
  channelId,
  className,
}: MeetingNotePanelProps) {
  return (
    <div className={cn('flex min-h-0 flex-1', className)}>
      <QueryBoundary
        loadingFallback={
          <div className="flex flex-1 items-center justify-center">
            <LoadingPane label="회의록을 불러오는 중…" />
          </div>
        }
        errorFallback={MeetingNotesError}
        resetKeys={[channelId]}
      >
        <MeetingNoteContent teamId={teamId} channelId={channelId} />
      </QueryBoundary>
    </div>
  );
}

function MeetingNoteContent({
  teamId,
  channelId,
}: {
  teamId: number;
  channelId: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: notes } = useSuspenseQuery(meetingNoteQueries.list(channelId));
  const { data: templates } = useSuspenseQuery(
    meetingNoteQueries.templates(channelId),
  );
  const { data: me } = useQuery(userQueries.me());
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword.trim().toLowerCase(), 200);

  const templateOf = (note: MeetingNote) =>
    templates.find((template) => template.id === note.templateId) ?? null;

  const filtered = debouncedKeyword
    ? notes.filter((note) =>
        note.title.toLowerCase().includes(debouncedKeyword),
      )
    : notes;

  // 고른 회의록이 지워졌거나 아직 고르지 않았으면 가장 최근 회의록을 보여 준다.
  // 검색어로 목록만 좁혀도 읽던 회의록이 바뀌지 않게 검색 결과가 아닌 전체 목록에서 고른다.
  const selectedId = Number(searchParams.get('note'));
  const selected =
    notes.find((note) => note.id === selectedId) ?? notes[0] ?? null;

  const showNote = (noteId: number | null) =>
    router.replace(
      noteId === null
        ? channelPath(teamId, channelId)
        : meetingNoteViewPath(teamId, channelId, noteId),
      { scroll: false },
    );
  const startCreate = () => router.push(meetingNoteNewPath(teamId, channelId));
  const openTemplates = () =>
    router.push(meetingNoteTemplatesPath(teamId, channelId));

  return (
    <>
      <aside className="flex w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low">
        <div className="flex shrink-0 flex-col gap-3 px-4 pt-4 pb-3">
          <div className="flex items-center gap-1">
            <h2 className="mr-auto typography-label-medium text-on-surface">
              회의록
              <span className="ml-1.5 text-on-surface-variant">
                {notes.length}
              </span>
            </h2>
            <IconButton
              aria-label="회의록 템플릿 관리"
              title="회의록 템플릿 관리"
              size="S"
              variant="clear"
              onClick={openTemplates}
              className="text-on-surface-variant"
            >
              <SettingsIcon />
            </IconButton>
            <Button size="S" onClick={startCreate}>
              <PlusIcon size={16} className="mr-1" />새 회의록
            </Button>
          </div>
          <label className="flex h-9 items-center gap-2 rounded-[10px] border border-outline-variant bg-surface px-3 focus-within:border-primary">
            <SearchIcon
              size={16}
              className="shrink-0 text-on-surface-variant"
            />
            <input
              type="search"
              value={keyword}
              placeholder="제목으로 찾기"
              aria-label="회의록 제목으로 찾기"
              onChange={(event) => setKeyword(event.target.value)}
              className="min-w-0 flex-1 bg-transparent typography-subtext-medium text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            />
          </label>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {filtered.map((note) => (
            <li key={note.id}>
              <NoteListItem
                note={note}
                selected={selected?.id === note.id}
                onSelect={() => showNote(note.id)}
              />
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center typography-subtext-medium text-on-surface-variant">
              {notes.length === 0
                ? '아직 회의록이 없어요'
                : '일치하는 회의록이 없어요'}
            </li>
          )}
        </ul>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {selected ? (
          <MeetingNoteViewer
            key={selected.id}
            channelId={channelId}
            note={selected}
            template={templateOf(selected)}
            canEdit={me?.id === selected.createdBy}
            onEdit={() =>
              router.push(meetingNoteEditPath(teamId, channelId, selected.id))
            }
            onDeleted={() => showNote(null)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<EditIcon />}
              title="첫 회의록을 남겨 보세요"
              description="마크다운으로 바로 회의 내용을 정리할 수 있어요"
              action={
                <Button size="S" onClick={startCreate}>
                  새 회의록 쓰기
                </Button>
              }
              className="max-w-md"
            />
          </div>
        )}
      </div>
    </>
  );
}

function NoteListItem({
  note,
  selected,
  onSelect,
}: {
  note: MeetingNote;
  selected: boolean;
  onSelect: () => void;
}) {
  const { data: author } = useQuery(userQueries.detail(note.createdBy));

  return (
    <button
      type="button"
      aria-current={selected ? 'true' : undefined}
      onClick={onSelect}
      className={cn(
        'flex w-full cursor-pointer flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors',
        selected
          ? 'bg-secondary-container text-on-secondary-container'
          : 'text-on-surface hover:bg-surface-variant',
      )}
    >
      <span className="truncate typography-label-small">{note.title}</span>
      <span className="flex items-center gap-1.5 typography-subtext-small text-on-surface-variant">
        <span className="truncate">
          {userDisplayName(author, `사용자 #${note.createdBy}`)}
        </span>
        <span aria-hidden>·</span>
        <span className="shrink-0">{formatDate(note.createdAt)}</span>
        {note.attachments.length > 0 && (
          <PaperclipIcon
            size={12}
            role="img"
            aria-hidden={false}
            aria-label={`첨부 ${note.attachments.length}개`}
            className="ml-auto shrink-0"
          />
        )}
      </span>
    </button>
  );
}

function MeetingNotesError({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="회의록을 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요"
        action={
          <Button size="S" variant="weak" onClick={resetErrorBoundary}>
            다시 시도
          </Button>
        }
      />
    </div>
  );
}
