import { queryOptions } from '@tanstack/react-query';

import { getMeetingNoteTemplates } from '@/entities/meeting-note/api/get-meeting-note-templates';
import { getMeetingNotes } from '@/entities/meeting-note/api/get-meeting-notes';

export const meetingNoteQueries = {
  all: () => ['meetingNote'] as const,
  list: (channelId: number) =>
    queryOptions({
      queryKey: [...meetingNoteQueries.all(), 'list', channelId],
      queryFn: () => getMeetingNotes(channelId),
    }),
  templates: (channelId: number) =>
    queryOptions({
      queryKey: [...meetingNoteQueries.all(), 'templates', channelId],
      queryFn: () => getMeetingNoteTemplates(channelId),
    }),
} as const;
