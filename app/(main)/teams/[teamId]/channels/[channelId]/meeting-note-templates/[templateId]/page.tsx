'use client';

import { notFound, useParams } from 'next/navigation';

import { MeetingNoteRoute } from '@/widgets/meeting-note/ui/meeting-note-route';
import { MeetingNoteTemplateEditor } from '@/widgets/meeting-note/ui/meeting-note-template-editor';
import { toRouteId, useRouteIds } from '@/shared/lib/use-route-ids';

export default function MeetingNoteTemplateEditPage() {
  const { teamId, channelId } = useRouteIds();
  const templateId = toRouteId(useParams<{ templateId?: string }>().templateId);

  if (teamId === null || channelId === null || templateId === null) {
    notFound();
  }

  return (
    <MeetingNoteRoute teamId={teamId} channelId={channelId}>
      <MeetingNoteTemplateEditor
        teamId={teamId}
        channelId={channelId}
        templateId={templateId}
      />
    </MeetingNoteRoute>
  );
}
