'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { CreateTeamModal } from '@/features/team-create/ui/create-team-modal';
import { teamQueries } from '@/entities/team/api/team-queries';
import { cn } from '@/shared/lib/cn';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { HOME_PATH, teamPath } from '@/shared/model/paths';
import { Avatar } from '@/shared/ui/avatar';
import { PlusIcon } from '@/shared/ui/icons/plus-icon';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface TeamRailProps {
  className?: string;
}

function TeamRailError({ resetErrorBoundary }: FallbackProps) {
  return (
    <li>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant typography-label-x-small flex size-12 items-center justify-center rounded-2xl text-center"
      >
        재시도
      </button>
    </li>
  );
}

const TEAM_RAIL_SKELETON = Array.from({ length: 3 }, (_, index) => (
  <li key={index}>
    <span className="bg-surface-container block size-12 animate-pulse rounded-2xl" />
  </li>
));

export function TeamRail({ className }: TeamRailProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { teamId: currentTeamId } = useRouteIds();

  return (
    <nav
      aria-label="팀"
      className={cn('bg-background flex w-18 shrink-0 flex-col items-center py-3', className)}
    >
      <Link
        href={HOME_PATH}
        aria-label="홈"
        aria-current={currentTeamId === null ? 'page' : undefined}
        className={cn(
          'flex size-12 items-center justify-center rounded-2xl transition-colors',
          currentTeamId === null
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
        )}
      >
        <span className="typography-label-medium font-bold">co</span>
      </Link>

      <span aria-hidden className="bg-outline-variant my-2 h-0.5 w-8 rounded-full" />

      <ul className="flex flex-col items-center gap-2">
        <QueryBoundary loadingFallback={TEAM_RAIL_SKELETON} errorFallback={TeamRailError}>
          <TeamLinks currentTeamId={currentTeamId} />
        </QueryBoundary>
      </ul>

      <button
        type="button"
        aria-label="팀 추가"
        aria-haspopup="dialog"
        onClick={() => setCreateOpen(true)}
        className="text-primary bg-surface-container hover:bg-surface-container-high mt-2 flex size-12 cursor-pointer items-center justify-center rounded-2xl transition-colors"
      >
        <PlusIcon size={20} />
      </button>

      <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </nav>
  );
}

function TeamLinks({ currentTeamId }: { currentTeamId: number | null }) {
  const { data: teams } = useSuspenseQuery(teamQueries.list());

  return (
    <>
      {teams.map((team) => {
        const active = team.id === currentTeamId;

        return (
          <li key={team.id} className="relative">
            {active && (
              <span
                aria-hidden
                className="bg-on-background absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full"
              />
            )}
            <Link
              href={teamPath(team.id)}
              title={team.name}
              aria-current={active ? 'page' : undefined}
              className="block"
            >
              <Avatar
                src={team.iconUrl ?? undefined}
                name={team.name}
                size={48}
                shape="squircle"
                tone={active ? 'red' : 'neutral'}
                className={cn('transition-opacity', !active && 'opacity-90 hover:opacity-100')}
              />
            </Link>
          </li>
        );
      })}
    </>
  );
}
