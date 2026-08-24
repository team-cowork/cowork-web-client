'use client';

import { type ReactNode, useEffect } from 'react';

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

  useEffect(() => {
    if (teamId === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') router.push(teamPath(teamId));
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [teamId, router]);

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
          className="fixed top-6 right-6 flex flex-col items-center gap-1.5 text-on-surface-variant hover:text-on-surface"
        >
          <span className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-outline-variant hover:border-outline">
            <CloseIcon size={18} />
          </span>
          <span className="typography-subtext-small">ESC</span>
        </button>
      </div>
    </div>
  );
}
