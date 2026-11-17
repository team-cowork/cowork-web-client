'use client';

import { notFound } from 'next/navigation';

import { MeetingNoteEditor } from '@/widgets/meeting-note/ui/meeting-note-editor';
import { MeetingNoteRoute } from '@/widgets/meeting-note/ui/meeting-note-route';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function MeetingNoteNewPage() {
  const { teamId, channelId } = useRouteIds();

  if (teamId === null || channelId === null) notFound();

  return (
    <MeetingNoteRoute teamId={teamId} channelId={channelId}>
      <MeetingNoteEditor teamId={teamId} channelId={channelId} noteId={null} />
    </MeetingNoteRoute>
  );
}
