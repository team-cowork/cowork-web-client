'use client';

import { useState } from 'react';

import { notFound, useRouter } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';

import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';
import {
  type MeetingNoteTemplate,
  SECTION_TITLE_MAX_LENGTH,
  TEMPLATE_NAME_MAX_LENGTH,
} from '@/entities/meeting-note/model/meeting-note';
import {
  TemplateSaveError,
  type TemplateSectionDraft,
  useSaveMeetingNoteTemplate,
} from '@/features/meeting-note-template/model/use-save-meeting-note-template';
import { MeetingNotePageHeader } from '@/widgets/meeting-note/ui/meeting-note-page-header';
import { getHttpErrorMessage } from '@/shared/api/http-error';
import { cn } from '@/shared/lib/cn';
import { createUuid } from '@/shared/lib/create-uuid';
import { meetingNoteTemplatesPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { IconButton } from '@/shared/ui/icon-button';
import { PlusIcon } from '@/shared/ui/icons/plus-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { Switch } from '@/shared/ui/switch';
import { TextField } from '@/shared/ui/text-field';
import { useToast } from '@/shared/ui/toast-provider';

interface SectionRow extends TemplateSectionDraft {
  /** 화면에서 줄을 구분하는 키. 새 섹션은 아직 id가 없다. */
  key: string;
}

export interface MeetingNoteTemplateEditorProps {
  teamId: number;
  channelId: number;
  /** null이면 새 템플릿을 만든다. */
  templateId: number | null;
}

export function MeetingNoteTemplateEditor({
  teamId,
  channelId,
  templateId,
}: MeetingNoteTemplateEditorProps) {
  const { data: templates } = useSuspenseQuery(
    meetingNoteQueries.templates(channelId),
  );
  const template =
    templateId === null
      ? null
      : (templates.find(({ id }) => id === templateId) ?? undefined);
  if (template === undefined) notFound();

  return (
    <TemplateForm
      key={templateId ?? 'new'}
      teamId={teamId}
      channelId={channelId}
      template={template}
      isFirstTemplate={templates.length === 0}
    />
  );
}

function TemplateForm({
  teamId,
  channelId,
  template,
  isFirstTemplate,
}: {
  teamId: number;
  channelId: number;
  template: MeetingNoteTemplate | null;
  isFirstTemplate: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const saveTemplate = useSaveMeetingNoteTemplate(channelId);
  const listPath = meetingNoteTemplatesPath(teamId, channelId);

  const [initialRows] = useState<SectionRow[]>(() =>
    template
      ? template.sections.map(({ id, title }) => ({
          key: String(id),
          id,
          title,
        }))
      : [{ key: createUuid(), title: '' }],
  );
  const [name, setName] = useState(template?.name ?? '');
  const [rows, setRows] = useState(initialRows);
  // 채널의 첫 템플릿은 회의록을 쓸 수 있게 기본으로 정한다.
  const [makeDefault, setMakeDefault] = useState(
    template?.isActive ?? isFirstTemplate,
  );
  const [submitted, setSubmitted] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [addedKey, setAddedKey] = useState<string | null>(null);
  // 새 템플릿이 만들어진 뒤 다음 단계가 실패하면, 다시 저장할 때 템플릿을 또 만들지 않도록 기억한다.
  const [savedTemplateId, setSavedTemplateId] = useState(template?.id ?? null);

  const trimmedName = name.trim();
  const nameError = trimmedName ? undefined : '템플릿 이름을 입력해 주세요';
  const titleCounts = new Map<string, number>();
  for (const row of rows) {
    const title = row.title.trim();
    if (title) titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
  }
  const rowError = (row: SectionRow) => {
    const title = row.title.trim();
    if (!title) return '섹션 이름을 입력해 주세요';
    if ((titleCounts.get(title) ?? 0) > 1) return '같은 이름의 섹션이 있어요';
    return undefined;
  };
  const sectionsError =
    rows.length === 0 ? '섹션을 하나 이상 추가해 주세요' : undefined;
  const hasError =
    !!nameError || !!sectionsError || rows.some((row) => rowError(row));

  const isDirty =
    name !== (template?.name ?? '') ||
    makeDefault !== (template?.isActive ?? isFirstTemplate) ||
    rows.length !== initialRows.length ||
    rows.some(
      (row, index) =>
        row.id !== initialRows[index]?.id ||
        row.title !== initialRows[index]?.title,
    );

  const addRow = () => {
    const key = createUuid();
    setRows((prev) => [...prev, { key, title: '' }]);
    setAddedKey(key);
  };

  const cancel = () => {
    if (isDirty) setDiscardOpen(true);
    else router.push(listPath);
  };

  const save = () => {
    setSubmitted(true);
    if (hasError) return;

    saveTemplate.mutate(
      {
        templateId: savedTemplateId,
        name: trimmedName,
        sections: rows.map(({ id, title }) => ({ id, title: title.trim() })),
        makeDefault,
        onCreated: setSavedTemplateId,
      },
      {
        onSuccess: () => router.push(listPath),
        onError: (error) => {
          const failure =
            error instanceof TemplateSaveError ? error.failure : error;
          const message = getHttpErrorMessage(
            failure,
            '템플릿을 저장하지 못했어요',
          );
          const partlyApplied =
            error instanceof TemplateSaveError && error.appliedCount > 0;
          toast(
            partlyApplied
              ? `${message}. 일부 변경은 이미 저장됐어요. 다시 저장하면 나머지만 반영돼요`
              : message,
          );
        },
      },
    );
  };

  return (
    <>
      <MeetingNotePageHeader
        title={template ? '템플릿 편집' : '새 템플릿'}
        backLabel="템플릿 목록으로"
        onBack={cancel}
        actions={
          <>
            <Button
              size="S"
              variant="weak"
              color="neutral"
              disabled={saveTemplate.isPending}
              onClick={cancel}
            >
              취소
            </Button>
            <Button size="S" disabled={saveTemplate.isPending} onClick={save}>
              {saveTemplate.isPending ? '저장하는 중…' : '저장'}
            </Button>
          </>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="mx-auto flex w-full max-w-[640px] flex-col gap-7 px-6 pt-8 pb-16"
        >
          <TextField
            label="템플릿 이름"
            value={name}
            maxLength={TEMPLATE_NAME_MAX_LENGTH}
            placeholder="예: 주간 회의"
            error={submitted ? nameError : undefined}
            onChange={(event) => setName(event.target.value)}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="typography-label-x-small text-on-surface-variant">
                섹션 구성
              </h2>
              <p className="typography-subtext-small text-on-surface-variant">
                새 섹션은 맨 아래에 추가돼요
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {rows.map((row, index) => {
                const error = submitted ? rowError(row) : undefined;
                return (
                  <li key={row.key} className="flex flex-col gap-1">
                    <div
                      className={cn(
                        'flex h-10 items-center gap-2 rounded-[10px] border bg-surface pr-1.5 pl-3.5 focus-within:border-primary',
                        error ? 'border-error' : 'border-outline-variant',
                      )}
                    >
                      <input
                        // 방금 추가한 줄은 바로 이름을 입력할 수 있게 포커스한다.
                        autoFocus={row.key === addedKey}
                        aria-label={`섹션 ${index + 1} 이름`}
                        aria-invalid={error ? true : undefined}
                        value={row.title}
                        maxLength={SECTION_TITLE_MAX_LENGTH}
                        placeholder="섹션 이름"
                        onChange={(event) =>
                          setRows((prev) =>
                            prev.map((candidate) =>
                              candidate.key === row.key
                                ? { ...candidate, title: event.target.value }
                                : candidate,
                            ),
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' &&
                            !event.nativeEvent.isComposing
                          ) {
                            event.preventDefault();
                            addRow();
                          }
                        }}
                        className="min-w-0 flex-1 bg-transparent typography-subtext-large text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                      />
                      <IconButton
                        aria-label={`${row.title || `섹션 ${index + 1}`} 삭제`}
                        size="S"
                        variant="clear"
                        onClick={() =>
                          setRows((prev) =>
                            prev.filter(({ key }) => key !== row.key),
                          )
                        }
                        className="size-7 text-on-surface-variant hover:text-error"
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>
                    {error && (
                      <p className="typography-subtext-small text-error">
                        {error}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
            {submitted && sectionsError && (
              <p className="typography-subtext-small text-error">
                {sectionsError}
              </p>
            )}
            <button
              type="button"
              onClick={addRow}
              className="mx-auto mt-1 flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 typography-subtext-medium text-on-surface-variant hover:text-on-surface"
            >
              <PlusIcon size={14} />
              섹션 추가
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[14px] border border-outline-variant bg-surface px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <p className="typography-label-small text-on-surface">
                기본 템플릿으로 사용
              </p>
              <p className="typography-subtext-small text-on-surface-variant">
                {template?.isActive
                  ? '기본 템플릿을 바꾸려면 다른 템플릿을 기본으로 정해 주세요'
                  : '새 회의록을 쓸 때 이 템플릿이 먼저 선택돼요'}
              </p>
            </div>
            <Switch
              aria-label="기본 템플릿으로 사용"
              checked={makeDefault}
              disabled={template?.isActive}
              onCheckedChange={setMakeDefault}
            />
          </div>
        </form>
      </div>

      <Dialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="변경 사항을 버릴까요?"
        description="저장하지 않은 내용은 사라집니다."
      >
        <Button
          variant="weak"
          color="neutral"
          onClick={() => setDiscardOpen(false)}
        >
          계속 편집
        </Button>
        <Button
          color="danger"
          onClick={() => {
            setDiscardOpen(false);
            router.push(listPath);
          }}
        >
          버리기
        </Button>
      </Dialog>
    </>
  );
}
