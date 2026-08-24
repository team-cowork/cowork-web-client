'use client';

import { type ReactNode } from 'react';

import { notFound, useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { teamQueries } from '@/entities/team/api/team-queries';
import { TeamSettingsNav } from '@/widgets/team-settings-nav/ui/team-settings-nav';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { teamPath } from '@/shared/model/paths';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

export default function TeamSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { teamId } = useRouteIds();
  const { data: team } = useQuery({
    ...teamQueries.detail(teamId ?? 0),
    enabled: teamId !== null,
  });

  if (teamId === null) notFound();

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <TeamSettingsNav teamId={teamId} teamName={team?.name ?? ''} />

      <div className="relative flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-10 py-12">{children}</div>

        <button
          type="button"
          aria-label="설정 닫기"
          onClick={() => router.push(teamPath(teamId))}
          className="fixed top-6 right-6 flex size-9 cursor-pointer items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface"
        >
          <CloseIcon size={18} />
        </button>
      </div>
    </div>
  );
}
