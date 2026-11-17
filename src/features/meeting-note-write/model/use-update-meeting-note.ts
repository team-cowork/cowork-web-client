'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';
import { patchMeetingNote } from '@/entities/meeting-note/api/patch-meeting-note';
import { type UpdateMeetingNoteRequest } from '@/entities/meeting-note/model/meeting-note';

export function useUpdateMeetingNote(channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      request,
    }: {
      noteId: number;
      request: UpdateMeetingNoteRequest;
    }) => patchMeetingNote(channelId, noteId, request),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        meetingNoteQueries.list(channelId).queryKey,
        (notes) =>
          notes?.map((note) => (note.id === updated.id ? updated : note)),
      );
    },
  });
}
