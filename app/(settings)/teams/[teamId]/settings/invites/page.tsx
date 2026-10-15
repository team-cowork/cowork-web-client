'use client';

import { notFound } from 'next/navigation';

import { TeamInviteSettings } from '@/widgets/team-invite-settings/ui/team-invite-settings';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function TeamSettingsInvitesPage() {
  const { teamId } = useRouteIds();

  if (teamId === null) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="typography-title-medium text-on-surface">초대 링크</h1>
      <TeamInviteSettings teamId={teamId} />
    </div>
  );
}
