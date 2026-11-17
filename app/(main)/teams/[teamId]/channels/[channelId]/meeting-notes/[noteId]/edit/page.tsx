'use client';

import { notFound, useParams } from 'next/navigation';

import { MeetingNoteEditor } from '@/widgets/meeting-note/ui/meeting-note-editor';
import { MeetingNoteRoute } from '@/widgets/meeting-note/ui/meeting-note-route';
import { toRouteId, useRouteIds } from '@/shared/lib/use-route-ids';

export default function MeetingNoteEditPage() {
  const { teamId, channelId } = useRouteIds();
  const noteId = toRouteId(useParams<{ noteId?: string }>().noteId);

  if (teamId === null || channelId === null || noteId === null) notFound();

  return (
    <MeetingNoteRoute teamId={teamId} channelId={channelId}>
      <MeetingNoteEditor
        teamId={teamId}
        channelId={channelId}
        noteId={noteId}
      />
    </MeetingNoteRoute>
  );
}
