'use client';

import { notFound } from 'next/navigation';

import { MeetingNoteRoute } from '@/widgets/meeting-note/ui/meeting-note-route';
import { MeetingNoteTemplateEditor } from '@/widgets/meeting-note/ui/meeting-note-template-editor';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function MeetingNoteTemplateNewPage() {
  const { teamId, channelId } = useRouteIds();

  if (teamId === null || channelId === null) notFound();

  return (
    <MeetingNoteRoute teamId={teamId} channelId={channelId}>
      <MeetingNoteTemplateEditor
        teamId={teamId}
        channelId={channelId}
        templateId={null}
      />
    </MeetingNoteRoute>
  );
}
