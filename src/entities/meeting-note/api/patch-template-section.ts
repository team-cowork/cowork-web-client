import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  type TemplateSection,
  type UpdateTemplateSectionRequest,
} from '@/entities/meeting-note/model/meeting-note';

/** 제목을 바꾸면 이 템플릿으로 쓴 회의록 본문의 키도 서버가 함께 옮긴다. */
export async function patchTemplateSection(
  channelId: number,
  templateId: number,
  sectionId: number,
  request: UpdateTemplateSectionRequest,
): Promise<TemplateSection> {
  const { data } = await instance.patch<ApiResponse<TemplateSection>>(
    `/channel/channels/${channelId}/meeting-note-templates/${templateId}/sections/${sectionId}`,
    request,
  );

  return data.data;
}
