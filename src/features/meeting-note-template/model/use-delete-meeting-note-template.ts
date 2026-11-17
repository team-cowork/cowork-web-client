'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteMeetingNoteTemplate } from '@/entities/meeting-note/api/delete-meeting-note-template';
import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';

export function useDeleteMeetingNoteTemplate(channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: number) =>
      deleteMeetingNoteTemplate(channelId, templateId),
    onSuccess: (_data, templateId) => {
      queryClient.setQueryData(
        meetingNoteQueries.templates(channelId).queryKey,
        (templates) =>
          templates?.filter((template) => template.id !== templateId),
      );
    },
  });
}
