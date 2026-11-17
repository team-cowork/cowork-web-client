import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  type CreateTemplateSectionRequest,
  type TemplateSection,
} from '@/entities/meeting-note/model/meeting-note';

/** 섹션은 추가한 순서대로 템플릿 끝에 붙는다. */
export async function postTemplateSection(
  channelId: number,
  templateId: number,
  request: CreateTemplateSectionRequest,
): Promise<TemplateSection> {
  const { data } = await instance.post<ApiResponse<TemplateSection>>(
    `/channel/channels/${channelId}/meeting-note-templates/${templateId}/sections`,
    request,
  );

  return data.data;
}
