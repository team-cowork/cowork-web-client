'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { meetingNoteQueries } from '@/entities/meeting-note/api/meeting-note-queries';
import { postMeetingNote } from '@/entities/meeting-note/api/post-meeting-note';
import { type CreateMeetingNoteRequest } from '@/entities/meeting-note/model/meeting-note';

export function useCreateMeetingNote(channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateMeetingNoteRequest) =>
      postMeetingNote(channelId, request),
    // 저장 직후 새 회의록을 바로 열 수 있게 목록 맨 앞에 먼저 넣어 둔다.
    onSuccess: (created) => {
      const { queryKey } = meetingNoteQueries.list(channelId);
      queryClient.setQueryData(queryKey, (notes) =>
        notes ? [created, ...notes] : notes,
      );
      return queryClient.invalidateQueries({ queryKey });
    },
  });
}
