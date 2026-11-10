'use client';

import { notFound } from 'next/navigation';

import { TeamGithubSettings } from '@/widgets/team-github-settings/ui/team-github-settings';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export default function TeamSettingsGithubPage() {
  const { teamId } = useRouteIds();

  if (teamId === null) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="typography-title-medium text-on-surface">GitHub 연동</h1>
      <TeamGithubSettings teamId={teamId} />
    </div>
  );
}
