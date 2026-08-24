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
        className="flex size-12 items-center justify-center rounded-2xl bg-surface-container text-center typography-label-x-small text-on-surface-variant hover:bg-surface-container-high"
      >
        재시도
      </button>
    </li>
  );
}

const TEAM_RAIL_SKELETON = Array.from({ length: 3 }, (_, index) => (
  <li key={index}>
    <span className="block size-12 animate-pulse rounded-2xl bg-surface-container" />
  </li>
));

export function TeamRail({ className }: TeamRailProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { teamId: currentTeamId } = useRouteIds();

  return (
    <nav
      aria-label="팀"
      className={cn(
        'flex w-18 shrink-0 flex-col items-center bg-background py-3',
        className,
      )}
    >
      <Link
        href={HOME_PATH}
        title="다이렉트 메시지"
        aria-label="다이렉트 메시지"
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

      <span
        aria-hidden
        className="my-2 h-0.5 w-8 rounded-full bg-outline-variant"
      />

      <ul className="flex flex-col items-center gap-2">
        <QueryBoundary
          loadingFallback={TEAM_RAIL_SKELETON}
          errorFallback={TeamRailError}
        >
          <TeamLinks currentTeamId={currentTeamId} />
        </QueryBoundary>
      </ul>

      <button
        type="button"
        aria-label="팀 추가"
        aria-haspopup="dialog"
        onClick={() => setCreateOpen(true)}
        className="mt-2 flex size-12 cursor-pointer items-center justify-center rounded-2xl bg-surface-container text-primary transition-colors hover:bg-surface-container-high"
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
                className="absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full bg-on-background"
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
                className={cn(
                  'transition-opacity',
                  !active && 'opacity-90 hover:opacity-100',
                )}
              />
            </Link>
          </li>
        );
      })}
    </>
  );
}
