'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTemplateSection } from '@/entities/meeting-note/api/delete-template-section';
import { getMeetingNoteTemplates } from '@/entities/meeting-note/api/get-meeting-note-templates';
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
  /** 저장할 템플릿. null이면 새로 만든다. */
  templateId: number | null;
  name: string;
  sections: TemplateSectionDraft[];
  makeDefault: boolean;
  /** 새 템플릿이 서버에 만들어진 순간 불린다. 이후 단계가 실패해도 다시 저장할 때 같은 템플릿을 쓰게 한다. */
  onCreated?: (templateId: number) => void;
}

/** 저장 도중 실패했을 때. 실패 전까지 서버에 반영된 요청 수를 함께 알린다. */
export class TemplateSaveError extends Error {
  constructor(
    readonly failure: unknown,
    readonly appliedCount: number,
  ) {
    super('템플릿을 저장하지 못했어요', { cause: failure });
    this.name = 'TemplateSaveError';
  }
}

async function findTemplate(
  channelId: number,
  templateId: number,
): Promise<MeetingNoteTemplate> {
  const templates = await getMeetingNoteTemplates(channelId);
  const template = templates.find(({ id }) => id === templateId);
  if (!template) throw new Error('템플릿을 찾을 수 없어요');
  return template;
}

/**
 * 편집 화면의 내용을 서버의 템플릿·섹션 API로 나눠 반영한다.
 * 서버에 일괄 저장 API가 없어 중간에 실패하면 앞선 변경은 남는다. 그래서 매번 서버의 최신 상태와
 * 비교해 필요한 요청만 보내고, 실패 뒤 다시 저장하면 남은 변경만 반영되게 한다.
 * 섹션 순서는 서버가 추가 순서로 정하므로, 새 섹션은 항상 끝에 붙는다.
 */
async function saveTemplate(
  channelId: number,
  {
    templateId,
    name,
    sections,
    makeDefault,
    onCreated,
  }: SaveMeetingNoteTemplateInput,
): Promise<number> {
  let appliedCount = 0;
  const apply = async <T>(request: Promise<T>): Promise<T> => {
    const result = await request;
    appliedCount += 1;
    return result;
  };

  try {
    let current: MeetingNoteTemplate;
    if (templateId === null) {
      current = await apply(postMeetingNoteTemplate(channelId, name));
      onCreated?.(current.id);
    } else {
      current = await findTemplate(channelId, templateId);
    }
    const id = current.id;

    if (current.name !== name) {
      await apply(patchMeetingNoteTemplate(channelId, id, name));
    }

    const serverIds = new Set(current.sections.map((section) => section.id));
    const draftIds = new Set(
      sections.flatMap((draft) =>
        draft.id !== undefined && serverIds.has(draft.id) ? [draft.id] : [],
      ),
    );
    // 지난 시도에서 이미 추가된 새 섹션은 같은 제목의 섹션을 그대로 쓴다.
    const adopted = new Map<TemplateSectionDraft, number>();
    for (const draft of sections) {
      if (draft.id !== undefined && draftIds.has(draft.id)) continue;
      const taken = new Set(adopted.values());
      const existing = current.sections.find(
        (section) =>
          section.title === draft.title &&
          !draftIds.has(section.id) &&
          !taken.has(section.id),
      );
      if (existing) adopted.set(draft, existing.id);
    }
    const keptIds = new Set([...draftIds, ...adopted.values()]);

    // 지운 섹션의 제목을 다른 섹션이 이어받을 수 있으니 삭제를 먼저 한다.
    for (const section of current.sections) {
      if (!keptIds.has(section.id)) {
        await apply(deleteTemplateSection(channelId, id, section.id));
      }
    }
    for (const draft of sections) {
      const section = current.sections.find(
        ({ id: sectionId }) => sectionId === draft.id,
      );
      if (
        section &&
        draftIds.has(section.id) &&
        section.title !== draft.title
      ) {
        await apply(
          patchTemplateSection(channelId, id, section.id, {
            title: draft.title,
          }),
        );
      }
    }
    for (const draft of sections) {
      const exists =
        (draft.id !== undefined && draftIds.has(draft.id)) ||
        adopted.has(draft);
      if (!exists) {
        await apply(
          postTemplateSection(channelId, id, {
            title: draft.title,
            type: 'MARKDOWN',
            isRequired: false,
          }),
        );
      }
    }

    if (makeDefault && !current.isActive) {
      await apply(patchMeetingNoteTemplateActivate(channelId, id));
    }

    return id;
  } catch (error) {
    throw new TemplateSaveError(error, appliedCount);
  }
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
