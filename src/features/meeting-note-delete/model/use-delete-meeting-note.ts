'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteMeetingNote } from '@/entities/meeting-note/api/delete-meeting-note';
import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';

export function useDeleteMeetingNote(channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: number) => deleteMeetingNote(channelId, noteId),
    onSuccess: (_data, noteId) => {
      queryClient.setQueryData(
        meetingNoteQueries.list(channelId).queryKey,
        (notes) => notes?.filter((note) => note.id !== noteId),
      );
    },
  });
}
