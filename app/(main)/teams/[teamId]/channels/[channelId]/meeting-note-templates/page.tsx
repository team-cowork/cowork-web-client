'use client';

import { notFound } from 'next/navigation';

import { MeetingNoteRoute } from '@/widgets/meeting-note/ui/meeting-note-route';
import { MeetingNoteTemplateList } from '@/widgets/meeting-note/ui/meeting-note-template-list';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function MeetingNoteTemplatesPage() {
  const { teamId, channelId } = useRouteIds();

  if (teamId === null || channelId === null) notFound();

  return (
    <MeetingNoteRoute teamId={teamId} channelId={channelId}>
      <MeetingNoteTemplateList teamId={teamId} channelId={channelId} />
    </MeetingNoteRoute>
  );
}
