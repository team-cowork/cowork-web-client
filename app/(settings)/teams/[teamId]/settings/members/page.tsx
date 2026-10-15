'use client';

import { notFound } from 'next/navigation';

import { TeamMemberSettings } from '@/widgets/team-member-settings/ui/team-member-settings';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function TeamSettingsMembersPage() {
  const { teamId } = useRouteIds();

  if (teamId === null) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="typography-title-medium text-on-surface">멤버</h1>
      <TeamMemberSettings teamId={teamId} />
    </div>
  );
}
