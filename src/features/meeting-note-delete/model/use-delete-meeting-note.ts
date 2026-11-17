'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteMeetingNote } from '@/entities/meeting-note/api/delete-meeting-note';
import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';
import { clearMeetingNoteDraft } from '@/entities/meeting-note/lib/meeting-note-draft';
import { userQueries } from '@/entities/user/api/user-queries';

export function useDeleteMeetingNote(channelId: number) {
  const queryClient = useQueryClient();
  const { data: me } = useQuery(userQueries.me());

  return useMutation({
    mutationFn: (noteId: number) => deleteMeetingNote(channelId, noteId),
    onSuccess: (_data, noteId) => {
      queryClient.setQueryData(
        meetingNoteQueries.list(channelId).queryKey,
        (notes) => notes?.filter((note) => note.id !== noteId),
      );
      // 지운 회의록을 고치다 남긴 임시저장본은 다시 쓸 일이 없다.
      if (me) clearMeetingNoteDraft({ userId: me.id, channelId, noteId });
    },
  });
}
