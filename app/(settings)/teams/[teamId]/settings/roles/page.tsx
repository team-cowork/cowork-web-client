'use client';

import { notFound } from 'next/navigation';

import { TeamRoleSettings } from '@/widgets/team-role-settings/ui/team-role-settings';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function TeamSettingsRolesPage() {
  const { teamId } = useRouteIds();

  if (teamId === null) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="typography-title-medium text-on-surface">역할</h1>
      <TeamRoleSettings teamId={teamId} />
    </div>
  );
}
