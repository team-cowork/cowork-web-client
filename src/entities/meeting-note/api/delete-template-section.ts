import { instance } from '@/shared/api/instance';

export async function deleteTemplateSection(
  channelId: number,
  templateId: number,
  sectionId: number,
): Promise<void> {
  await instance.delete(
    `/channel/channels/${channelId}/meeting-note-templates/${templateId}/sections/${sectionId}`,
  );
}
