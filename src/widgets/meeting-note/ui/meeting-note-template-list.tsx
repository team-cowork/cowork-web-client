'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';

import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';
import { type MeetingNoteTemplate } from '@/entities/meeting-note/model/meeting-note';
import { useDeleteMeetingNoteTemplate } from '@/features/meeting-note-template/model/use-delete-meeting-note-template';
import { MeetingNotePageHeader } from '@/widgets/meeting-note/ui/meeting-note-page-header';
import { getHttpErrorMessage } from '@/shared/api/http-error';
import {
  channelPath,
  meetingNoteTemplateEditPath,
  meetingNoteTemplateNewPath,
} from '@/shared/model/paths';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { IconButton } from '@/shared/ui/icon-button';
import { EditIcon } from '@/shared/ui/icons/edit-icon';
import { PlusIcon } from '@/shared/ui/icons/plus-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { useToast } from '@/shared/ui/toast-provider';

export interface MeetingNoteTemplateListProps {
  teamId: number;
  channelId: number;
}

/** 회의록 채널에서 쓸 템플릿을 카드로 모아 보여 준다. */
export function MeetingNoteTemplateList({
  teamId,
  channelId,
}: MeetingNoteTemplateListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: templates } = useSuspenseQuery(
    meetingNoteQueries.templates(channelId),
  );
  const deleteTemplate = useDeleteMeetingNoteTemplate(channelId);
  const [deleting, setDeleting] = useState<MeetingNoteTemplate | null>(null);

  const newPath = meetingNoteTemplateNewPath(teamId, channelId);

  const handleDelete = () => {
    if (!deleting) return;
    deleteTemplate.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
      onError: (error) => {
        setDeleting(null);
        toast(getHttpErrorMessage(error, '템플릿을 삭제하지 못했어요'));
      },
    });
  };

  return (
    <>
      <MeetingNotePageHeader
        title="회의록 템플릿"
        description="회의록 작성 시 사용할 양식을 관리합니다"
        backLabel="회의록 목록으로"
        onBack={() => router.push(channelPath(teamId, channelId))}
        actions={
          <Button size="S" onClick={() => router.push(newPath)}>
            <PlusIcon size={16} className="mr-1" />새 템플릿
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-10">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 2xl:max-w-[1320px]">
          {templates.map((template) => (
            <li key={template.id}>
              <TemplateCard
                template={template}
                onEdit={() =>
                  router.push(
                    meetingNoteTemplateEditPath(teamId, channelId, template.id),
                  )
                }
                onDelete={() => setDeleting(template)}
              />
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => router.push(newPath)}
              className="flex h-full min-h-[77px] w-full cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-outline-variant typography-subtext-medium text-on-surface-variant transition-colors hover:border-outline hover:text-on-surface"
            >
              <PlusIcon size={14} />새 템플릿 만들기
            </button>
          </li>
        </ul>
      </div>

      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="템플릿을 삭제할까요?"
        description={
          deleting
            ? `"${deleting.name}" 템플릿이 삭제되며, 되돌릴 수 없습니다. 이 템플릿으로 쓴 회의록이 있으면 삭제할 수 없어요.`
            : undefined
        }
      >
        <Button
          variant="weak"
          color="neutral"
          disabled={deleteTemplate.isPending}
          onClick={() => setDeleting(null)}
        >
          취소
        </Button>
        <Button
          color="danger"
          disabled={deleteTemplate.isPending}
          onClick={handleDelete}
        >
          {deleteTemplate.isPending ? '삭제하는 중…' : '삭제'}
        </Button>
      </Dialog>
    </>
  );
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: MeetingNoteTemplate;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-outline-variant bg-surface px-4 py-3.5">
      <div className="flex items-center gap-2">
        <h2 className="min-w-0 truncate typography-label-medium text-on-surface">
          {template.name}
        </h2>
        {template.isActive && <Badge color="brand">기본</Badge>}
        <div className="ml-auto flex shrink-0 items-center">
          <IconButton
            aria-label={`${template.name} 템플릿 편집`}
            size="S"
            variant="clear"
            onClick={onEdit}
            className="size-7 text-on-surface-variant hover:text-on-surface"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label={`${template.name} 템플릿 삭제`}
            title={
              template.isActive
                ? '기본 템플릿은 삭제할 수 없어요. 다른 템플릿을 기본으로 정한 뒤 삭제해 주세요'
                : undefined
            }
            size="S"
            variant="clear"
            disabled={template.isActive}
            onClick={onDelete}
            className="size-7 text-on-surface-variant hover:text-error"
          >
            <TrashIcon />
          </IconButton>
        </div>
      </div>
      {template.sections.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {template.sections.map((section) => (
            <li key={section.id}>
              <Badge>{section.title}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="typography-subtext-small text-on-surface-variant">
          섹션이 없어요
        </p>
      )}
    </article>
  );
}
