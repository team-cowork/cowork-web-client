'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTemplateSection } from '@/entities/meeting-note/api/delete-template-section';
import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';
import { patchMeetingNoteTemplate } from '@/entities/meeting-note/api/patch-meeting-note-template';
import { patchMeetingNoteTemplateActivate } from '@/entities/meeting-note/api/patch-meeting-note-template-activate';
import { patchTemplateSection } from '@/entities/meeting-note/api/patch-template-section';
import { postMeetingNoteTemplate } from '@/entities/meeting-note/api/post-meeting-note-template';
import { postTemplateSection } from '@/entities/meeting-note/api/post-template-section';
import { type MeetingNoteTemplate } from '@/entities/meeting-note/model/meeting-note';

/** 편집 화면의 섹션 한 줄. id가 없으면 새로 추가한 섹션이다. */
export interface TemplateSectionDraft {
  id?: number;
  title: string;
}

export interface SaveMeetingNoteTemplateInput {
  /** 없으면 새 템플릿을 만든다. */
  original: MeetingNoteTemplate | null;
  name: string;
  sections: TemplateSectionDraft[];
  makeDefault: boolean;
}

/**
 * 편집 화면에서 바꾼 내용을 서버의 템플릿·섹션 API로 나눠 반영한다.
 * 서버에 일괄 저장 API가 없어 중간에 실패하면 앞선 변경은 남는다.
 * 섹션 순서는 서버가 추가 순서로 정하므로, 새 섹션은 항상 끝에 붙는다.
 */
async function saveTemplate(
  channelId: number,
  { original, name, sections, makeDefault }: SaveMeetingNoteTemplateInput,
): Promise<number> {
  const template = original ?? (await postMeetingNoteTemplate(channelId, name));
  const templateId = template.id;

  if (original && original.name !== name) {
    await patchMeetingNoteTemplate(channelId, templateId, name);
  }

  if (original) {
    const keptIds = new Set(sections.flatMap(({ id }) => (id ? [id] : [])));
    // 지운 섹션의 제목을 다른 섹션이 이어받을 수 있으니 삭제를 먼저 한다.
    for (const section of original.sections) {
      if (!keptIds.has(section.id)) {
        await deleteTemplateSection(channelId, templateId, section.id);
      }
    }
    for (const draft of sections) {
      const before = original.sections.find(({ id }) => id === draft.id);
      if (before && before.title !== draft.title) {
        await patchTemplateSection(channelId, templateId, before.id, {
          title: draft.title,
        });
      }
    }
  }

  for (const draft of sections) {
    if (draft.id === undefined) {
      await postTemplateSection(channelId, templateId, {
        title: draft.title,
        type: 'MARKDOWN',
        isRequired: false,
      });
    }
  }

  if (makeDefault && !template.isActive) {
    await patchMeetingNoteTemplateActivate(channelId, templateId);
  }

  return templateId;
}

export function useSaveMeetingNoteTemplate(channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveMeetingNoteTemplateInput) =>
      saveTemplate(channelId, input),
    // 일부만 반영되고 실패해도 화면이 서버 상태를 따라가도록 결과와 상관없이 다시 불러온다.
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: meetingNoteQueries.templates(channelId).queryKey,
      }),
  });
}
