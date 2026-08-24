'use client';

import { notFound } from 'next/navigation';

import { TeamProfileSettings } from '@/widgets/team-profile-settings/ui/team-profile-settings';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function TeamSettingsProfilePage() {
  const { teamId } = useRouteIds();

  if (teamId === null) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="typography-title-medium text-on-surface">서버 프로필</h1>
      <TeamProfileSettings teamId={teamId} />
    </div>
  );
}
